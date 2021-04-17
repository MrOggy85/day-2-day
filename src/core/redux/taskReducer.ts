import uuid from 'uuid';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from './types';
import { readJsonFile, resetJsonFile, writeJsonFile } from '../files/files';
import { Alert } from 'react-native';
import { showModal } from '../navigation/showModal';

const NAMESPACE = 'task';

async function readWriteToFile(updateTasks: (tasks: Task[]) => Task[]) {
  let tasks = await readJsonFile<Task[]>('tasks.json');
  if (!tasks) {
    tasks = []
  }

  // if (!tasks) {
  //   Alert.alert('Debug?', '', [
  //     {
  //       text: 'Yes',
  //       onPress: () => {
  //         showModal({
  //           screen: 'DEBUG',
  //           title: 'Debug',
  //         })
  //       }
  //     },
  //     {
  //       text: 'No',
  //     },
  //   ]);
  //   throw Error('Problem loading Tasks from JSON');
  // }

  const updatedTasks = updateTasks(tasks);
  const result = await writeJsonFile<Task[]>('tasks.json', updatedTasks);
  if (!result) {
    throw Error('Task not saved in Localstorage');
  }
}

export const loadTask = createAsyncThunk<
Task[],
void,
{}
>(
  `${NAMESPACE}/load`,
  async (_, _thunkApi) => {
    console.log('load...')
    const tasks = await readJsonFile<Task[]>('tasks.json');
    console.log('loaded', tasks)
    if (!tasks) {
      await resetJsonFile('tasks.json', '');
      return [];
    }
    return tasks;
  },
);

type TaskAdd = Omit<Task, 'id'>;

export const addTask = createAsyncThunk<
Task,
TaskAdd,
{}
>(
  `${NAMESPACE}/add`,
  async (task, _thunkApi) => {
    const id = uuid.v4();
    const taskWithId = {
      ...task,
      id,
    };

    await readWriteToFile((tasks) => {
      tasks.push(taskWithId);
      return tasks;
    });
    return taskWithId;
  },
);

export const updateTask = createAsyncThunk<
Task[],
Task,
{}
>(
  `${NAMESPACE}/update`,
  async (task, _thunkApi) => {
    let newTasks: Task[] = [];

    await readWriteToFile((tasks) => {
      newTasks = tasks.filter(x => x.id !== task.id);
      newTasks.push(task);
      return newTasks;
    });
    return newTasks;
  },
);

export const removeTask = createAsyncThunk<
Task[],
Task['id'],
{}
>(
  `${NAMESPACE}/remove`,
  async (taskId, _thunkApi) => {
    let newTasks: Task[] = [];

    await readWriteToFile((tasks) => {
      newTasks = tasks.filter(x => x.id !== taskId);
      return newTasks;
    });
    return newTasks;
  },
);

const taskSlice = createSlice({
  name: NAMESPACE,
  initialState: {
    tasks: [] as Task[],
  },
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addTask.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(removeTask.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });

    builder.addCase(loadTask.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
  },
});

export default taskSlice;
