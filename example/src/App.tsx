import * as React from 'react';

import {StyleSheet, View} from 'react-native';
import TimePicker from 'react-native-limit-timepicker';

export default function App() {
  return (
    <View style={styles.container}>
      <TimePicker
        // minDate={
        //   dayjs(new Date()).format('DD/MM/YYYY') ===
        //   dayjs(dateLoading).format('DD/MM/YYYY')
        //     ? dayjs(new Date()).add(5, 'm').toDate()
        //     : undefined
        // }
        // maxDate={
        //   dayjs(dateUnloading).format('DD/MM/YYYY') ===
        //   dayjs(dateLoading).format('DD/MM/YYYY')
        //     ? dateUnloading
        //     : undefined
        // }
        disabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
