import taskSlice from './taskReducer';
import eventSlice from './eventReducer';
import mainReducer from './mainReducer';

const rootReducer = {
  task: taskSlice.reducer,
  event: eventSlice.reducer,
  main: mainReducer.reducer,
};

export default rootReducer;
