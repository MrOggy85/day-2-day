import React from 'react';
import { View, Text, Pressable } from 'react-native';
import DatePicker from 'react-native-date-picker';
import CheckBox from '@react-native-community/checkbox';
import styles from './styles';

type DateInputProps = {
  label: string;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  isChecked: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
}

const DateInput = ({
  label,
  date,
  isChecked,
  setIsChecked,
  setDate,
}: DateInputProps) => {
  return (
    <View>
      <Text style={styles.label}>
        {label}
      </Text>
      <View style={styles.inputWrapper}>
        <CheckBox
          value={isChecked}
          onValueChange={setIsChecked}
          boxType="square"
          animationDuration={0.1}
        />
        <DatePicker
          style={styles.datePicker}
          date={date}
          onDateChange={setDate}
          is24hourSource="locale"
          locale="en-SE"
        />
        <Pressable
          onPress={() => {
            setDate(new Date());
          }}
        >
          <Text
            numberOfLines={2}
            style={styles.resetText}
          >
            Reset to Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default DateInput;
