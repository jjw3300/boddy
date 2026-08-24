import React, { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { CafeSummary } from '../types';
import { Coords } from '../services/location';
import { KAKAO_JS_KEY } from '../config';
import { buildKakaoMapHtml } from '../lib/kakaoMapHtml';

interface Props {
  userLocation: Coords;
  cafes: CafeSummary[];
  style?: StyleProp<ViewStyle>;
}

export function CafeMap({ userLocation, cafes, style }: Props) {
  const html = useMemo(
    () => buildKakaoMapHtml(userLocation, cafes, KAKAO_JS_KEY),
    [userLocation, cafes],
  );

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html, baseUrl: 'http://localhost' }}
      style={style}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      androidLayerType="hardware"
    />
  );
}
