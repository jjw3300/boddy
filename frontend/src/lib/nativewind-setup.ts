import { FlatList } from 'react-native';
import { remapProps } from 'nativewind';

// FlatList는 NativeWind가 contentContainerClassName을 기본 지원하지 않아 수동 매핑.
remapProps(FlatList, {
  contentContainerClassName: 'contentContainerStyle',
});
