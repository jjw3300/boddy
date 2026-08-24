import { COLORS } from '../design';
import { CafeSummary } from '../types';
import { Coords } from '../services/location';

function escapeForJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

export function buildKakaoMapHtml(userLocation: Coords, cafes: CafeSummary[], jsKey: string): string {
  const cafeMarkersJs = cafes
    .map(
      c => `
        (function () {
          var marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(${c.lat}, ${c.lng}),
            image: cafeMarkerImage,
            map: map,
          });
          bounds.extend(marker.getPosition());
          var iw = new kakao.maps.InfoWindow({
            content: '<div style="padding:6px 10px;font-size:12px;font-weight:700;white-space:nowrap;">${escapeForJs(c.name)}</div>',
            removable: false,
          });
          kakao.maps.event.addListener(marker, 'click', function () { iw.open(map, marker); });
        })();`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
    #fallback {
      display: none; width: 100%; height: 100%; align-items: center; justify-content: center;
      flex-direction: column; gap: 6px; font-family: sans-serif; color: #78716C; text-align: center; padding: 0 24px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="fallback">
    <div style="font-size:13px;font-weight:700;">지도를 불러오지 못했어요</div>
    <div id="fallback-detail" style="font-size:11px;"></div>
  </div>
  <script>
    function showFallback(detail) {
      document.getElementById('map').style.display = 'none';
      document.getElementById('fallback').style.display = 'flex';
      document.getElementById('fallback-detail').textContent = detail || '';
    }
  </script>
  <script
    src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false"
    onerror="showFallback('SDK 스크립트 로드 실패 (키 형식 또는 네트워크 확인)')"
  ></script>
  <script>
    try {
      if (typeof kakao === 'undefined' || !kakao.maps || !kakao.maps.load) {
        showFallback('SDK가 로드되지 않았어요');
      } else {
        kakao.maps.load(function () {
          try {
            var map = new kakao.maps.Map(document.getElementById('map'), {
              center: new kakao.maps.LatLng(${userLocation.lat}, ${userLocation.lng}),
              level: 5,
            });
            map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

            var bounds = new kakao.maps.LatLngBounds();

            var userMarkerImage = new kakao.maps.MarkerImage(
              'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="8" fill="${COLORS.info}" stroke="white" stroke-width="3"/></svg>'
              ),
              new kakao.maps.Size(28, 28),
              { offset: new kakao.maps.Point(14, 14) }
            );
            var userMarker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(${userLocation.lat}, ${userLocation.lng}),
              image: userMarkerImage,
              map: map,
              zIndex: 10,
            });
            bounds.extend(userMarker.getPosition());

            var cafeMarkerImage = new kakao.maps.MarkerImage(
              'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 23 17 23s17-10.3 17-23C34 7.6 26.4 0 17 0z" fill="${COLORS.primary}"/><circle cx="17" cy="17" r="7" fill="${COLORS.foreground}"/></svg>'
              ),
              new kakao.maps.Size(34, 40),
              { offset: new kakao.maps.Point(17, 40) }
            );

            ${cafeMarkersJs}
            ${cafes.length > 0 ? 'map.setBounds(bounds);' : ''}
          } catch (e) {
            showFallback((e && e.message) || '지도 초기화 오류');
          }
        });
      }
    } catch (e) {
      showFallback((e && e.message) || 'SDK 오류');
    }
  </script>
</body>
</html>`;
}
