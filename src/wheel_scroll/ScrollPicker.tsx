import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type Ref,
} from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

export type ItemT = string | number;

function isNumeric(str: string | unknown): boolean {
  if (typeof str === 'number') {
    return true;
  }
  if (typeof str !== 'string') {
    return false;
  }
  return (
    !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

const deviceWidth = Dimensions.get('window').width;

const isViewStyle = (style: ViewProps['style']): style is ViewStyle => {
  return (
    typeof style === 'object' &&
    style !== null &&
    Object.keys(style).includes('height')
  );
};

export type ScrollPickerProps = {
  style?: ViewProps['style'];
  dataSource: Array<ItemT>;
  minIndex?: number;
  maxIndex?: number;
  selectedIndex?: number;
  onValueChange?: (value: ItemT | undefined, index: number) => void;
  renderItem?: (data: ItemT, index: number, isSelected: boolean) => JSX.Element;
  renderText?: (data: ItemT) => string;
  highlightColor?: string;
  highlightBorderWidth?: number;
  itemTextStyle?: object;
  activeItemTextStyle?: object;
  itemHeight?: number;
  wrapperHeight?: number;
  wrapperBackground?: string;
  // TODO: add proper type to `scrollViewComponent` prop
  // tried using ComponentType<ScrollViewProps & { ref: React.RefObject<ScrollView> }>
  // but ScrollView component from react-native-gesture=handler is not compatible with this.
  scrollViewComponent?: any;
};

export type ScrollPickerHandle = {
  scrollToTargetIndex: (val: number) => void;
};

const ScrollPicker: {
  (props: ScrollPickerProps & {ref?: Ref<ScrollPickerHandle>});
} = React.forwardRef((propsState, ref) => {
  const {itemHeight = 30, style, scrollViewComponent, ...props} = propsState;
  const [initialized, setInitialized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    props.selectedIndex !== undefined && props.selectedIndex >= 0
      ? props.selectedIndex < (props.minIndex ?? 0)
        ? props.minIndex ?? 0
        : props.selectedIndex > (props.maxIndex ?? props.dataSource.length)
        ? props.maxIndex ?? props.dataSource.length
        : props.selectedIndex
      : 0,
  );
  const sView = useRef<ScrollView>(null);
  const [isScrollTo, setIsScrollTo] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const [momentumStarted, setMomentumStarted] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    scrollToTargetIndex: (val: number) => {
      setSelectedIndex(val);
      sView?.current?.scrollTo({y: val * itemHeight});
    },
  }));

  const wrapperHeight =
    props.wrapperHeight ||
    (isViewStyle(style) && isNumeric(style.height)
      ? Number(style.height)
      : 0) ||
    itemHeight * 5;

  useEffect(() => {
    const temp =
      props.selectedIndex !== undefined && props.selectedIndex >= 0
        ? props.selectedIndex < (props.minIndex ?? 0)
          ? props.minIndex ?? 0
          : props.selectedIndex > (props.maxIndex ?? props.dataSource.length)
          ? props.maxIndex ?? props.dataSource.length
          : props.selectedIndex
        : 0;
    setSelectedIndex(temp);

    const y = itemHeight * temp;
    sView?.current?.scrollTo({y: y});
  }, [
    props.minIndex,
    props.maxIndex,
    itemHeight,
    props.selectedIndex,
    props.dataSource,
  ]);

  useEffect(
    function initialize() {
      if (initialized) {
        return;
      }
      setInitialized(true);

      setTimeout(() => {
        const y = itemHeight * selectedIndex;
        sView?.current?.scrollTo({y: y});
      }, 0);

      return () => {
        timer && clearTimeout(timer);
      };
    },
    [initialized, itemHeight, selectedIndex, sView, timer],
  );

  const renderPlaceHolder = () => {
    const h = (wrapperHeight - itemHeight) / 2;
    const header = <View style={{height: h, flex: 1}} />;
    const footer = <View style={{height: h, flex: 1}} />;
    return {header, footer};
  };

  const renderItem = (data: (typeof props.dataSource)[0], index: number) => {
    const isSelected = index === selectedIndex;
    const item = props.renderItem ? (
      props.renderItem(data, index, isSelected)
    ) : (
      <Text
        style={
          isSelected
            ? [
                props.activeItemTextStyle
                  ? props.activeItemTextStyle
                  : styles.activeItemTextStyle,
              ]
            : [props.itemTextStyle ? props.itemTextStyle : styles.itemTextStyle]
        }>
        {props.renderText ? props.renderText(data) : data}
      </Text>
    );

    return (
      <View style={[styles.itemWrapper, {height: itemHeight}]} key={index}>
        {item}
      </View>
    );
  };
  const scrollFix = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      let y = 0;
      const h = itemHeight;
      if (e.nativeEvent.contentOffset) {
        y = e.nativeEvent.contentOffset.y;
      }
      let _selectedIndex = Math.round(y / h);

      if (props.minIndex !== undefined && _selectedIndex < props.minIndex) {
        _selectedIndex = props.minIndex;
      } else if (
        props.maxIndex !== undefined &&
        _selectedIndex > props.maxIndex
      ) {
        _selectedIndex = props.maxIndex;
      }

      const _y = _selectedIndex * h;
      if (_y !== y) {
        // using scrollTo in ios, onMomentumScrollEnd will be invoked
        if (Platform.OS === 'ios') {
          setIsScrollTo(true);
        }
        sView?.current?.scrollTo({y: _y});
      }
      if (selectedIndex === _selectedIndex) {
        return;
      }
      // onValueChange
      if (props.onValueChange) {
        const selectedValue = props.dataSource[_selectedIndex];
        setSelectedIndex(_selectedIndex);
        props.onValueChange(selectedValue, _selectedIndex);
      }
    },
    [itemHeight, props, selectedIndex],
  );

  const onScrollBeginDrag = () => {
    setDragStarted(true);

    if (Platform.OS === 'ios') {
      setIsScrollTo(false);
    }
    timer && clearTimeout(timer);
  };

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setDragStarted(false);

    // if not used, event will be garbaged
    const _e: NativeSyntheticEvent<NativeScrollEvent> = {...e};
    timer && clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        if (!momentumStarted) {
          scrollFix(_e);
        }
      }, 50),
    );
  };
  const onMomentumScrollBegin = () => {
    setMomentumStarted(true);
    timer && clearTimeout(timer);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setMomentumStarted(false);

    if (!isScrollTo && !dragStarted) {
      scrollFix(e);
    }
  };

  const {header, footer} = renderPlaceHolder();
  const highlightWidth = (isViewStyle(style) ? style.width : 0) || deviceWidth;
  const highlightColor = props.highlightColor || '#333';
  const highlightBorderWidth =
    props.highlightBorderWidth || StyleSheet.hairlineWidth;

  const wrapperStyle: ViewStyle = {
    height: wrapperHeight,
    flex: 1,
    backgroundColor: props.wrapperBackground || '#fafafa',
    overflow: 'hidden',
  };

  const highlightStyle: ViewStyle = {
    position: 'absolute',
    top: (wrapperHeight - itemHeight) / 2,
    height: itemHeight,
    width: highlightWidth,
    borderTopColor: highlightColor,
    borderBottomColor: highlightColor,
    borderTopWidth: highlightBorderWidth,
    borderBottomWidth: highlightBorderWidth,
  };

  const CustomScrollViewComponent = scrollViewComponent || ScrollView;

  return (
    <View style={wrapperStyle}>
      <View style={highlightStyle} />
      <CustomScrollViewComponent
        ref={sView}
        bounces={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        onMomentumScrollBegin={(_e: any) => onMomentumScrollBegin()}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          onMomentumScrollEnd(e)
        }
        onScrollBeginDrag={(_e: any) => onScrollBeginDrag()}
        onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          onScrollEndDrag(e)
        }>
        {header}
        {props.dataSource.map(renderItem)}
        {footer}
      </CustomScrollViewComponent>
    </View>
  );
});
export default ScrollPicker;

const styles = StyleSheet.create({
  itemWrapper: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextStyle: {
    color: '#999',
  },
  activeItemTextStyle: {
    color: '#333',
  },
});
