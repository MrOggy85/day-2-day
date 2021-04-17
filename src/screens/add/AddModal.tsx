import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Keyboard } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Input from '../../components/Input';
import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask, updateTask } from '../../core/redux/taskReducer';
import { Task } from '../../core/redux/types';
import { DateTime, Interval } from 'luxon';
import { addEvent, removeEvent, updateEvent } from '../../core/redux/eventReducer';
import DurationInput from './DurationInput';
import DateInput from './DateInput';
import mainSlice from '../../core/redux/mainReducer';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    padding: 20,
    backgroundColor: 'whitesmoke',
    borderTopWidth: 0.5,
  },
  topTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitleText: {
    fontSize: 20,
  },
  topTitleButtonWrapper: {
    width: '30%',
  },
  visibleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibleLabel: {
    paddingLeft: 10,
    fontSize: 20,
  },
});

type AddType = 'TASK' | 'EVENT'

type OwnProps = {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  id?: Task['id'];
  suggestedStartDate?: Date;
  suggestAddType?: AddType;
};
type Props = OwnProps // & NavigationComponentProps;

const AddScreen = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.task.tasks);
  const events = useSelector(state => state.event.events);
  const suggestedStartDate = useSelector(state => state.main.modalStartDate)
  const suggestAddType = useSelector(state => state.main.modalEditType)
  const id = useSelector(state => state.main.modalEditId)

  const initStartDate = suggestedStartDate
    ? DateTime.fromISO(suggestedStartDate)
    : DateTime.local()

  const [topTitle, setTopTitle] = useState('');
  const [addType, setAddType] = useState(suggestAddType || 'TASK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasStartDate, setHasStartDate] = useState(false);
  const [startDate, setStartDate] = useState(initStartDate.toJSDate());
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(initStartDate.plus({ hour: 1}).toJSDate());

  const hideModal = () => {
    dispatch(mainSlice.actions.hideModal());
  }

  useEffect(() => {
    if (id) {
      const item = addType === 'TASK'
        ? tasks.find(x => x.id === id)
        : events.find(x => x.id === id);
      if (!item) {
        return;
      }
      setTitle(item.title);
      setDescription(item.description);
      setStartDate(DateTime.fromISO(item.startDate).toJSDate());
      setDueDate(DateTime.fromISO(item.endDate).toJSDate());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const addEdit = id ? 'Edit' : 'Add';
    setTopTitle(addType === 'TASK' ? `${addEdit} Task` : `${addEdit} Event`);
  }, [id, addType]);

  useEffect(() => {
    if (!suggestedStartDate) {
      return;
    }
    const newStartDate = suggestedStartDate
    ? DateTime.fromISO(suggestedStartDate)
    : DateTime.local()
    setStartDate(newStartDate.toJSDate());
    setDueDate(newStartDate.plus({ hour: 1}).toJSDate());
  }, [suggestedStartDate])

  const onAdd = () => {
    if (addType === 'TASK') {
      dispatch(addTask({
        title,
        description,
        startDate: DateTime.fromJSDate(startDate).toISO(),
        endDate: DateTime.fromJSDate(dueDate).toISO(),
        completed: false,
      }));
    } else {
      dispatch(addEvent({
        title,
        description,
        startDate: DateTime.fromJSDate(startDate).toISO(),
        endDate: DateTime.fromJSDate(dueDate).toISO(),
      }));
    }

    hideModal();
  };

  const onChange = useCallback(() => {
    if (!id) {
      return;
    }
    if (addType === 'TASK') {
      const task = tasks.find(x => x.id === id);
      if (!task) {
        return;
      }

      dispatch(updateTask({
        id,
        title,
        description,
        startDate: DateTime.fromJSDate(startDate).toISO(),
        endDate: DateTime.fromJSDate(dueDate).toISO(),
        completed: task.completed,
      }));
    } else {
      const event = events.find(x => x.id === id);
      if (!event) {
        return;
      }

      dispatch(updateEvent({
        id,
        title,
        description,
        startDate: DateTime.fromJSDate(startDate).toISO(),
        endDate: DateTime.fromJSDate(dueDate).toISO(),
      }));
    }

    hideModal();
  }, [id, addType, startDate, dueDate, tasks, events]);

  const onRemove = useCallback(() => {
    if (!id) {
      return;
    }

    if (addType === 'TASK') {
      dispatch(removeTask(id));
    } else {
      dispatch(removeEvent(id));
    }

    hideModal();
  }, [id, addType]);

  const interval = Interval.fromDateTimes(startDate, dueDate);
  const minutes = interval.count('minutes') - 1;
  const hourDiff = Math.floor(minutes / 60);
  const minuteDiff = minutes % 60;

  useEffect(() => {
    if (startDate.getTime() > dueDate.getTime()) {
      setDueDate(startDate);
    }
  }, [startDate, dueDate]);

  const onHourScrollEnd = useCallback((hour: number) => {
    const dueDateMinute = DateTime.fromJSDate(dueDate).minute;
    const newDueDate = DateTime.fromJSDate(startDate).plus({ hours: hour }).set({ minute: dueDateMinute });
    setDueDate(newDueDate.toJSDate());
  },[dueDate, startDate]);

  const onMinuteScrollEnd = useCallback((minute: number) => {
    const dueDateHour = DateTime.fromJSDate(dueDate).hour;
    const newDueDate = DateTime.fromJSDate(startDate).plus({ minutes: minute }).set({ hour: dueDateHour });
    setDueDate(newDueDate.toJSDate());
  },[dueDate, startDate]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => {
        Keyboard.dismiss();
      }}>
        <View style={styles.root}>
          <View style={styles.topTitleWrapper}>
            <Text style={styles.topTitleText}>{topTitle}</Text>
            <View style={styles.topTitleButtonWrapper}>
              <Button
                text="Switch"
                onPress={() => {
                  setAddType(addType === 'TASK' ? 'EVENT' : 'TASK')
                }}
              />
            </View>
            <View style={styles.topTitleButtonWrapper}>
              <Button
                text="Close"
                onPress={() => {
                  hideModal()
                }}
              />
            </View>
          </View>

          <Input
            label="Title"
            text={title}
            setText={setTitle}
          />
          <TextArea
            label="Description"
            text={description}
            setText={setDescription}
          />
          <DateInput
            label="Start Date"
            date={startDate}
            setDate={setStartDate}
            isChecked={hasStartDate}
            setIsChecked={setHasStartDate}
          />
          <DurationInput
            hour={hourDiff}
            minute={minuteDiff}
            onHourScrollEnd={onHourScrollEnd}
            onMinuteScrollEnd={onMinuteScrollEnd}
          />
          <View style={styles.visibleWrapper}>
            <CheckBox
              boxType="square"
              animationDuration={0.1}
            />
            <Text style={styles.visibleLabel}>
              Visible before Start Date
            </Text>
          </View>
          <DateInput
            label={addType === 'TASK' ? 'Due Date' : 'End Date'}
            date={dueDate}
            setDate={setDueDate}
            isChecked={hasDueDate}
            setIsChecked={setHasDueDate}
          />
          <Button
            text={id ? 'Change' : 'Add'}
            onPress={id ? onChange : onAdd}
            disabled={!title}
          />
          {!!id && (
            <Button
              text="Remove"
              onPress={onRemove}
            />
          )}
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default AddScreen;
