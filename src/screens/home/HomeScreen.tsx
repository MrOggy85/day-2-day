import React, { ComponentProps, FunctionComponent, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, ViewStyle, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { DateTime } from 'luxon';
import Color from 'color';
import { loadTask, updateTask } from '../../core/redux/taskReducer';
import type { Event, Task } from '../../core/redux/types';
import { loadEvents } from '../../core/redux/eventReducer';
import ListItem from '../../components/ListItem';
import { accent } from '../../core/colors';
import useDispatch from '../../core/redux/useDispatch';
import mainSlice from '../../core/redux/mainReducer';

type Dispatch = ReturnType<typeof useDispatch>;
type PressableStyle = ComponentProps<typeof Pressable>['style'];
type ShowModal = Parameters<typeof mainSlice.actions.showModal>[0]

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'whitesmoke',
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  headerListItem: {
    height: 20,
    justifyContent: 'center',
    width: '100%',
    paddingLeft: 10,
  },
  nothingListItem: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 10,
  },
  nothingListItemText: {
    fontStyle: 'italic',
  },
  bottomContent: {
    flexDirection: 'row',
    height: 50,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  buttonAdd: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  loadMoreDateWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreDateText: {
    fontSize: 16,
  },
  scrollView: {
    backgroundColor: '#FFF',
  },
  activityIndicatorHide: {
    opacity: 0,
  },
  listItemTaskCompletedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  listItemEventOldText: {
    color: '#666',
  },
});

type BottonButtonProps = {
  text: string;
  isActive: boolean;
  activeBackgroundColor: ViewStyle['backgroundColor'];
  onPress: ComponentProps<typeof Pressable>['onPress'];
}

const BottomButton: FunctionComponent<BottonButtonProps> = ({ text, isActive, activeBackgroundColor, onPress }) => {
  const backgroundColor = isActive ? activeBackgroundColor : '#CCC';
  const pressedStyle: PressableStyle = ({ pressed }) => ({
    backgroundColor: pressed ? accent.DISABLED : backgroundColor,
  });
  return (
    <Pressable
      onPress={onPress}
      style={pressedStyle}
    >
      <View style={styles.bottomButton}>
        <Text>
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

type RenderTaskListItemParams = {
  item: Task;
  showModal: (params: ShowModal) => void;
  dispatch: Dispatch;
}

function renderTaskListItem({ item, showModal, dispatch }: RenderTaskListItemParams) {
  const onEditPress = () => {
    showModal({
      id: item.id,
      startDate:'',
      taskOrEvent: 'TASK',
    })
  };
  const onCompletePress = () => {
    dispatch(updateTask({
      ...item,
      completed: !item.completed,
    }));
  };

  return (
    <ListItem
      key={`task-${item.id}`}
      title={item.title}
      subtitle={item.description}
      backgroundColor={item.completed ? Color(accent.TASK).lighten(0.2).hex() : accent.TASK}
      options={[
        {
          iconName: 'edit',
          iconColor: accent.INFO,
          onPress: onEditPress,
        },
        {
          iconName: 'check-square',
          iconColor: accent.SUCCESS,
          onPress: onCompletePress,
        },
      ]}
      textStyle={item.completed ? styles.listItemTaskCompletedText : undefined}
    />
  );
}

type RenderEventListItemParams = {
  item: Event;
  date: DateTime;
  showModal: (params: ShowModal) => void;
  dispatch: Dispatch;
}

function renderEventListItem({ item, date, showModal, dispatch }: RenderEventListItemParams) {
  const isOld = DateTime.fromISO(item.endDate).diffNow().milliseconds < 0;

  const onEditPress = () => {
    showModal({
      id: item.id,
      startDate:'',
      taskOrEvent: 'EVENT',
    })
  };

  return (
    <ListItem
      key={`event-${item.id}-${date.day}`}
      title={item.title}
      subtitle={item.description}
      backgroundColor={isOld ? Color(accent.EVENT).lighten(0.4).hex() : accent.EVENT}
      options={[
        {
          iconName: 'edit',
          iconColor: accent.INFO,
          onPress: onEditPress,
        },
      ]}
      textStyle={isOld ? styles.listItemEventOldText : undefined}
    />
  );
}

type HeaderListItemProps = {
  text: string;
  backgroundColor?: ViewStyle['backgroundColor'];
}

const HeaderListItem: FunctionComponent<HeaderListItemProps> = ({ text, backgroundColor }) => {
  return (
    <View style={[styles.headerListItem, { backgroundColor }]}>
      <Text>
        {text}
      </Text>
    </View>
  );
};

type NothingListItemProps = {
  text: string;
  date: DateTime;
  showModal: (params: ShowModal) => void;
}

const pressedStyle: PressableStyle = ({ pressed }) => ({
  backgroundColor: pressed ? accent.DISABLED : '#FFF',
});

const NothingListItem = ({ text, date, showModal }: NothingListItemProps) => {
  const onPress = () => {
    showModal({
      id: '',
      startDate: date.toISO(),
      taskOrEvent: 'TASK',
    })
  };

  return (
    <View style={styles.nothingListItem}>
      <Text style={styles.nothingListItemText}>
        {text}
      </Text>
      <Pressable
        onPress={onPress}
        style={pressedStyle}
      >
        <View style={styles.buttonAdd}>
          <Icon
            name="plus-square"
            color={accent.INFO}
            size={24}
          />
        </View>
      </Pressable>
    </View>
  );
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.task.tasks);
  const events = useSelector(state => state.event.events);
  const [taskActive, setTaskActive] = useState(true);
  const [eventActive, setEventActive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [daysInView, setDaysInView] = useState(20);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isBottomRefreshing, setIsBottomRefreshing] = useState(false);

  const showModal = (params: ShowModal) => {
    dispatch(mainSlice.actions.showModal(params))
  }

  useEffect(() => {
    dispatch(loadTask());
    dispatch(loadEvents());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTaskPress = () => {
    setTaskActive(!taskActive);
  };
  const onEventPress = () => {
    setEventActive(!eventActive);
  };

  const listItems = [];
  const now = DateTime.now();
  for (let index = 0; index < daysInView; index++) {
    const dayPlusMinus = index + currentDayIndex;
    const date = dayPlusMinus >= 0
      ? now.plus({ day: dayPlusMinus })
      : now.plus({ day: dayPlusMinus });

    const isToday = dayPlusMinus === 0;
    const header = (
      <HeaderListItem
        key={`header-${index}`}
        text={`${date.toFormat('yyyy-MM-dd')}${isToday ? ' - Today' : ''}`}
        backgroundColor={isToday ? accent.HIGHLIGHT : '#DDD'}
      />
    );
    listItems.push(header);

    const tasksOfTheDay = taskActive ? tasks.filter(x => {
      const taskDate = DateTime.fromISO(x.startDate);
      return date.hasSame(taskDate, 'day');
    }) : [];

    const eventsOfTheDay = eventActive ? events.filter(x => {
      const eventStartDate = DateTime.fromISO(x.startDate);
      const eventEndDate = DateTime.fromISO(x.endDate);
      const startDateIsAfter = date.diff(eventStartDate).toMillis() > 0;
      const endDateIsBefore = date.diff(eventEndDate).toMillis() < 0;
      return startDateIsAfter && endDateIsBefore;
    }) : [];

    if (tasksOfTheDay.length === 0 && eventsOfTheDay.length === 0) {
      listItems.push((
        <NothingListItem
          key={`header-${index}-empty`}
          date={date}
          text="Nothing"
          showModal={showModal}
        />
      ));
    } else {
      const taskListItems = tasksOfTheDay.map(x => (
        renderTaskListItem({
          item: x,
          dispatch,
          showModal,
        })
      ));
      const eventListItems = eventsOfTheDay.map(x => (
        renderEventListItem({
          item: x,
          date,
          dispatch,
          showModal,
        })
      ));

      listItems.push(...taskListItems, ...eventListItems, (
        <NothingListItem
          key={`header-${index}-empty`}
          text=""
          date={date}
          showModal={showModal}
        />
      ));
    }
  }

  const onRefresh = () => {
    setCurrentDayIndex(currentDayIndex - 5);
    setDaysInView(daysInView + 5);
  };

  const onBottomPull = () => {
    setDaysInView(daysInView + 5);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.mainContent}>
          <View style={styles.loadMoreDateWrapper}>
            <Text style={styles.loadMoreDateText}>
              {isBottomRefreshing ? 'Release to load more dates' : 'Pull to load more dates'}
            </Text>
            <ActivityIndicator style={isBottomRefreshing ? undefined : styles.activityIndicatorHide} />
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            }
            onScroll={(e) => {
              const scrollViewHeight = e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height;
              const currentOffset = e.nativeEvent.contentOffset.y;
              const threashhold = 120;
              if (currentOffset > scrollViewHeight + threashhold) {
                if (!isBottomRefreshing) {
                  setIsBottomRefreshing(true);
                }
              } else {
                if (isBottomRefreshing) {
                  setIsBottomRefreshing(false);
                }
              }
            }}
            scrollEventThrottle={32}
            onScrollEndDrag={(e) => {
              const scrollViewHeight = e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height;
              const currentOffset = e.nativeEvent.contentOffset.y;
              const threashhold = 120;
              if (currentOffset > scrollViewHeight + threashhold) {
                onBottomPull();
              }
            }}
          >
            {listItems}
          </ScrollView>

        </View>
        <View style={styles.bottomContent}>
          <BottomButton
            text="Tasks"
            isActive={taskActive}
            activeBackgroundColor={accent.TASK}
            onPress={onTaskPress}
          />
          <BottomButton
            text="Events"
            isActive={eventActive}
            activeBackgroundColor={accent.EVENT}
            onPress={onEventPress}
          />
          <BottomButton
            text="Priority"
            isActive={false}
            activeBackgroundColor={accent.HIGHLIGHT}
            onPress={() => {}}
          />
          <BottomButton
            text="Tags"
            isActive={false}
            activeBackgroundColor={accent.HIGHLIGHT}
            onPress={() => {}}
          />
          <BottomButton
            text="Profile"
            isActive={false}
            activeBackgroundColor={accent.HIGHLIGHT}
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
