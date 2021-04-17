import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { Navigation, NavigationComponentProps, NavigationFunctionComponent } from 'react-native-navigation';
import PagerView from 'react-native-pager-view';
import TaskScreen from '../task/TaskScreen';
import HomeScreen from '../home/HomeScreen';
import CalendarScreen from '../calendar/CalendarScreen';
import AddScreen from '../add/AddModal';
import { useSelector } from 'react-redux';
import useDispatch from '../../core/redux/useDispatch';
import mainSlice from '../../core/redux/mainReducer';

type OwnProps = {};
type Props = OwnProps & NavigationComponentProps;

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
});

const titles = ['Tasks', 'Agenda', 'Calendar'];
let currentPage = 1;

type MainContentProps = {
  componentId: Props['componentId'];
}

const MainContent = ({ componentId }: MainContentProps) => {
  console.log('MainContent...');

  return (
    <PagerView
      style={styles.pagerView}
      initialPage={currentPage}
      onPageSelected={(e) => {
        const title = titles[e.nativeEvent.position];
        currentPage = e.nativeEvent.position;

        Navigation.mergeOptions(componentId, {
          topBar: {
            title: {
              text: title,
            },
            rightButtons: [
              {
                id: 'TOP_BAR_ADD_BUTTON',
                text: 'ADD',
              },
            ],
          },
        });
      }}
    >
      <View key="1">
        <TaskScreen />
      </View>
      <View key="2">
        <HomeScreen
        />
      </View>
      <View key="3">
        <CalendarScreen />
      </View>
    </PagerView>
  )
}

const AddModalWrapper = () => {
  const dispatch = useDispatch();
  const show = useSelector(state => state.main.showModal)

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (show) {
        dispatch(mainSlice.actions.hideModal());
        return true
      } else {
        Alert.alert('Exit the app?', '', [
          {
            text: 'Yes',
            onPress: () => {
              BackHandler.exitApp();
            },
          },
          {
            text: 'No',
          },
        ])
        return true;
      }
    })
    return () => {
      subscription.remove();
    }
  }, [show])

  return (
    <View
      style={{ position: 'absolute', bottom: 0, width: '100%', opacity: show ? 1: 0 }}
      pointerEvents={show ? 'auto' : 'none'}
    >
      <AddScreen />
    </View>
  )
}

const MainScreen: NavigationFunctionComponent<Props> = ({ componentId }: Props) => {
  return (
    <>
      <MainContent
        componentId={componentId}
      />
      <AddModalWrapper />
    </>
  );
};

export default MainScreen;
