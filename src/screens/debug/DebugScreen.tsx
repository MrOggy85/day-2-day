import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import Button from '../../components/Button';
import TextArea from '../../components/TextArea';
import { readJsonFileRaw, writeJsonFile } from '../../core/files/files';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

async function readTasks(setTaskText: React.Dispatch<React.SetStateAction<string>>) {
  const contents = await readJsonFileRaw('tasks.json');
  setTaskText(contents);
}

const DebugScreen = () => {
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    readTasks(setTaskText);
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <TextArea
          label="task.json"
          text={taskText}
          setText={setTaskText}
        />
        <Button
          text="Save"
          onPress={() => {
            writeJsonFile('tasks.json', taskText)
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default DebugScreen;
