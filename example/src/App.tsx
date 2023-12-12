import * as React from 'react';

import {StyleSheet, View} from 'react-native';
import TimePicker from 'react-native-limit-timepicker';

export default function App() {
  return (
    <View style={styles.container}>
      <TimePicker
        customMinutesData={[0, 15, 30, 45]}
        onChangeHour={value => console.log('hour: ', value)}
        onChangeMinute={value => console.log('minute: ', value)}
        onChangePeriod={value => console.log('period: ', value)}
        minDate={new Date()}
        time={new Date()}
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
