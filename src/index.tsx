import React, {useEffect, useState} from 'react';
import {View, StyleSheet, type ViewStyle, type TextStyle} from 'react-native';
import ScrollPicker, {type ItemT} from './wheel_scroll/ScrollPicker';

const defaultHourData: ItemT[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const defaultMinutesData: ItemT[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
];
const defaultPeriodData: ItemT[] = ['AM', 'PM'];

export type TimePickerProps = {
  customHourData?: ItemT[];
  customMinutesData?: ItemT[];
  customPeriodData?: ItemT[];
  renderTextHour?: (data: ItemT) => string;
  renderTextMinute?: (data: ItemT) => string;
  renderTextPeriod?: (data: ItemT) => string;
  onChangeHour?: (value: ItemT | undefined, index: number) => void;
  onChangeMinute?: (value: ItemT | undefined, index: number) => void;
  onChangePeriod?: (value: ItemT | undefined, index: number) => void;
  date?: string;
  disabled?: boolean;
  time?: string;
  minDate?: Date;
  maxDate?: Date;
  containerStyle?: ViewStyle;
  scrollHourStyle?: ViewStyle;
  scrollMinuteStyle?: ViewStyle;
  scrollPeriodStyle?: ViewStyle;
  highlightColor?: string;
  highlightBorderWidth?: number;
  hourTextStyle?: TextStyle;
  minuteTextStyle?: TextStyle;
  periodTextStyle?: TextStyle;
  activeItemTextStyle?: object;
  itemHeight?: number;
  wrapperHeight?: number;
  wrapperBackground?: string;
};
const TimePicker: {
  (props: TimePickerProps);
} = React.forwardRef(propsState => {
  // export default function TimePicker({
  //   customHourData,
  //   customMinutesData,
  //   customPeriodData,
  //   onChangeHour,
  //   onChangeMinute,
  //   onChangePeriod,
  //   disabled,
  //   time,
  //   minDate,
  //   maxDate,
  //   containerStyle,
  //   scrollHourStyle,
  //   scrollMinuteStyle,
  //   scrollPeriodStyle,
  //   highlightColor = '#d8d8d8',
  //   highlightBorderWidth = 1,
  //   itemTextStyle,
  //   activeItemTextStyle,
  //   itemHeight = 60,
  //   wrapperHeight,
  //   wrapperBackground = '#FFFFFF',
  // }: TimePickerProps) {
  const {
    customHourData,
    customMinutesData,
    customPeriodData,
    onChangeHour,
    onChangeMinute,
    onChangePeriod,
    disabled,
    time,
    minDate,
    maxDate,
    containerStyle,
    scrollHourStyle,
    scrollMinuteStyle,
    scrollPeriodStyle,
    highlightColor = '#d8d8d8',
    highlightBorderWidth = 1,
    hourTextStyle,
    minuteTextStyle,
    periodTextStyle,
    activeItemTextStyle,
    itemHeight = 60,
    wrapperHeight,
    wrapperBackground = '#FFFFFF',
    renderTextHour,
    renderTextMinute,
    renderTextPeriod,
    // ...props
  } = propsState;

  const hourData = customHourData ?? defaultHourData;
  const minutesData = customMinutesData ?? defaultMinutesData;
  const periodData = customPeriodData ?? defaultPeriodData;
  const [selectedHour, setSelectedHour] = useState(
    parseInt(time?.split(':')[0] ?? '0', 10) > 11
      ? parseInt(time?.split(':')[0] ?? '0', 10) - 12
      : parseInt(time?.split(':')[0] ?? '0', 10),
  );
  const [selectedMinutes, setSelectedMinutes] = useState(
    parseInt(time?.split(':')[1] ?? '0', 10),
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    parseInt(time?.split(':')[0] ?? '0', 10) > 11 ? 1 : 0,
  );
  const [minHour, setMinHour] = useState<number | undefined>(undefined);
  const [minMinutes, setMinMinutes] = useState<number | undefined>(undefined);
  const [minPeriod, setMinPeriod] = useState<number | undefined>(undefined);
  const [maxHour, setMaxHour] = useState<number | undefined>(undefined);
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>(undefined);
  const [maxPeriod, setMaxPeriod] = useState<number | undefined>(undefined);

  useEffect(() => {
    let lastMinuteData: number;

    if (
      minutesData[minutesData.length - 1] &&
      typeof minutesData[minutesData.length - 1] === 'number'
    ) {
      lastMinuteData = minutesData[minutesData.length - 1] as number;
    } else {
      lastMinuteData =
        parseInt(minutesData[minutesData.length - 1] as string) ?? 0;
    }
    if (minDate !== undefined) {
      if (minDate.getHours() === 11) {
        if (minDate.getMinutes() >= lastMinuteData) {
          setMinHour(undefined);
          setMinMinutes(undefined);
          setMinPeriod(1);
        } else {
          setMinPeriod(undefined);
          if (selectedPeriod === 0) {
            setMinHour(11);
            setMinMinutes(1);
          } else {
            setMinHour(undefined);
            setMinMinutes(undefined);
          }
        }
      } else if (minDate.getHours() > 11) {
        if (minDate.getMinutes() >= lastMinuteData) {
          setMinHour(minDate.getHours() - 11);
          setMinMinutes(
            minDate.getHours() - 11 >= selectedHour &&
              minDate.getMinutes() < lastMinuteData
              ? 1
              : undefined,
          );
        } else {
          setMinHour(minDate.getHours() - 12);
          setMinMinutes(
            minDate.getHours() - 12 >= selectedHour &&
              minDate.getMinutes() < lastMinuteData
              ? 1
              : undefined,
          );
        }
        setMinPeriod(1);
      } else {
        setMinPeriod(undefined);
        if (minDate.getMinutes() >= lastMinuteData) {
          setMinHour(selectedPeriod !== 0 ? 0 : minDate.getHours() + 1);
          setMinMinutes(
            selectedPeriod === 0 &&
              minDate.getHours() + 1 >= selectedHour &&
              minDate.getMinutes() < lastMinuteData
              ? 1
              : undefined,
          );
        } else {
          setMinHour(selectedPeriod !== 0 ? 0 : minDate.getHours());
          setMinMinutes(
            selectedPeriod === 0 &&
              minDate.getHours() >= selectedHour &&
              minDate.getMinutes() < lastMinuteData
              ? 1
              : undefined,
          );
        }
      }
    } else {
      setMinPeriod(undefined);
      setMinHour(undefined);
      setMinMinutes(undefined);
    }

    if (maxDate !== undefined) {
      if (maxDate.getHours() === 12) {
        if (maxDate.getMinutes() === 0) {
          setMaxHour(undefined);
          setMaxMinutes(undefined);
          setMaxPeriod(0);
        } else if (maxDate.getMinutes() <= lastMinuteData) {
          setMaxPeriod(0);
          if (selectedPeriod === 0) {
            setMaxHour(undefined);
            setMaxMinutes(undefined);
          } else {
            setMaxHour(0);
            setMaxMinutes(0);
          }
        } else {
          setMaxPeriod(0);
          if (selectedPeriod === 0) {
            setMaxHour(undefined);
            setMaxMinutes(undefined);
          } else {
            setMaxHour(0);
            setMaxMinutes(undefined);
          }
        }
      } else if (maxDate.getHours() > 12) {
        if (maxDate.getMinutes() === 0) {
          setMinHour(maxDate.getHours() - 13);
          setMaxMinutes(undefined);
        } else {
          setMinHour(maxDate.getHours() - 12);
          setMaxMinutes(
            maxDate.getHours() - 12 <= selectedHour &&
              maxDate.getMinutes() > lastMinuteData
              ? 0
              : undefined,
          );
        }
      } else {
        setMaxPeriod(0);

        if (maxDate.getMinutes() === 0) {
          setMinHour(maxDate.getHours() - 1);
          setMaxMinutes(undefined);
        } else {
          setMinHour(maxDate.getHours());
          setMaxMinutes(
            maxDate.getHours() <= selectedHour &&
              maxDate.getMinutes() > lastMinuteData
              ? 0
              : undefined,
          );
        }
      }
    } else {
      setMaxPeriod(undefined);
      setMaxHour(undefined);
      setMaxMinutes(undefined);
    }
  }, [
    selectedHour,
    selectedMinutes,
    selectedPeriod,
    minDate,
    maxDate,
    minutesData,
  ]);

  const defaultRenderTextHour = (data: string | number): string =>
    typeof data === 'number'
      ? data < 10
        ? `0${data}`
        : data.toString()
      : data;
  const defaultRenderTextMinute = (data: string | number): string =>
    typeof data === 'number'
      ? data < 10
        ? `0${data}`
        : data.toString()
      : data;
  const defaultRenderTextPeriod = (data: string | number): string =>
    data.toString();
  // useEffect(() => {
  //   setChecked(isImmediately);
  // }, [isImmediately]);

  // const openTimePicker = () => {
  //   modalizeRef.current?.open();
  // };

  // const handleClose = () => {
  //   modalizeRef.current?.close();
  // };

  // const handleConfirm = () => {
  //   let value;
  //   if (selectedHour === 0 && selectedMinutes === 0 && selectedPeriod === 0) {
  //     value = `${hourData[minHour ?? 0] + (minPeriod ?? 0) * 12}:${
  //       minutesData[minMinutes ?? 0]
  //     }`;
  //   } else {
  //     value = `${hourData[selectedHour] + selectedPeriod * 12}:${
  //       minutesData[selectedMinutes]
  //     }`;
  //   }

  //   const timeValue = dayjs(`${date} ${value}`, 'YYYY.MM.DD HH:mm').toDate();
  //   checked ? onCheckNow?.() : onChangeValue?.(timeValue);
  //   // setVal(value);
  //   handleClose();
  // };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[styles.scrollHour, scrollHourStyle]}
        pointerEvents={disabled ? 'none' : undefined}>
        <ScrollPicker
          minIndex={minHour}
          maxIndex={maxHour}
          dataSource={hourData}
          selectedIndex={selectedHour}
          renderText={renderTextHour ?? defaultRenderTextHour}
          onValueChange={(data, selectedIndex) => {
            setSelectedHour(selectedIndex);
            onChangeHour?.(data, selectedIndex);
          }}
          wrapperHeight={wrapperHeight}
          wrapperBackground={wrapperBackground}
          itemHeight={itemHeight}
          itemTextStyle={[styles.time, hourTextStyle]}
          activeItemTextStyle={[styles.timeSelected, activeItemTextStyle]}
          highlightColor={highlightColor}
          highlightBorderWidth={highlightBorderWidth}
        />
      </View>
      <View style={styles.viewTwoDots}>
        <View style={styles.viewDot} />
        <View style={styles.viewDot} />
      </View>
      <View>
        <View
          style={[styles.scrollMinutes, scrollMinuteStyle]}
          pointerEvents={disabled ? 'none' : undefined}>
          <ScrollPicker
            minIndex={minMinutes}
            maxIndex={maxMinutes}
            dataSource={minutesData}
            selectedIndex={selectedMinutes}
            renderText={renderTextMinute ?? defaultRenderTextMinute}
            onValueChange={(data, selectedIndex) => {
              setSelectedMinutes(selectedIndex);
              onChangeMinute?.(data, selectedIndex);
            }}
            wrapperHeight={wrapperHeight}
            wrapperBackground={wrapperBackground}
            itemHeight={itemHeight}
            itemTextStyle={[styles.time, minuteTextStyle]}
            activeItemTextStyle={[styles.timeSelected, activeItemTextStyle]}
            highlightColor={highlightColor}
            highlightBorderWidth={highlightBorderWidth}
          />
        </View>
      </View>
      <View>
        <View
          style={[styles.scrollPeriod, scrollPeriodStyle]}
          pointerEvents={disabled ? 'none' : undefined}>
          <ScrollPicker
            minIndex={minPeriod}
            maxIndex={maxPeriod}
            dataSource={periodData}
            selectedIndex={selectedPeriod}
            renderText={renderTextPeriod ?? defaultRenderTextPeriod}
            onValueChange={(data, selectedIndex) => {
              setSelectedPeriod(selectedIndex);
              onChangePeriod?.(data, selectedIndex);
            }}
            wrapperHeight={wrapperHeight}
            wrapperBackground={wrapperBackground}
            itemHeight={itemHeight}
            itemTextStyle={[styles.time, periodTextStyle]}
            activeItemTextStyle={[styles.timeSelected, activeItemTextStyle]}
            highlightColor={highlightColor}
            highlightBorderWidth={highlightBorderWidth}
          />
        </View>
      </View>
    </View>
  );
});

export default TimePicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 12,
  },
  timeSelected: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#074988',
  },
  time: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E1EEFA',
  },
  scrollHour: {
    width: 69,
  },
  scrollMinutes: {
    width: 69,
  },
  scrollPeriod: {
    width: 50,
    paddingHorizontal: 4,
  },
  viewDot: {
    width: 4,
    height: 4,
    backgroundColor: '#8D939A',
    borderRadius: 9999,
  },
  viewTwoDots: {
    flexDirection: 'column',
    gap: 12,
  },
  viewNow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingTop: 12,
  },
});
