import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const directions = [ ['Терапия', 1297.5, 1797.2, '#BCA9E8'], ['Ортопедия', 520.7, 636.3, '#F6C79B'], ['Ортодонтия', 376.4, 432.9, '#BCD492'], ['Имплантология', 326.6, 373.3, '#A2D6B4'], ['Хирургия', 278.5, 318.2, '#E7A8CC'], ['Проф. и гигиена', 187.3, 218, '#ABE4D4'], ['Остальные', 401.9, 467.8, '#BCC9D3'] ] as const;
function Metric({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return <View style={d.metric}><Text style={d.muted}>{label}</Text><Text style={[d.value, large && d.large]}>{value}</Text></View>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={d.card}><Text style={d.title}>{title}</Text>{children}</View>;
}
// Иллюстративные линии: исходный скриншот не содержит числового ряда.
function Trend({ colors }: { colors: string[] }) {
  const [width, setWidth] = useState(0);
  const series = [[32, 45, 36, 51, 39, 57, 49, 61, 52, 68, 57, 65], [20, 27, 24, 35, 28, 43, 40, 45, 38, 51, 44, 53]];
  return <View accessibilityLabel="Иллюстративный график, не фактическая история показателей" style={d.trend} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
    {[20, 50, 80].map(top => <View key={top} style={[d.grid, { top }]} />)}
    {width > 0 && colors.map((color, line) => series[line % 2].slice(0, -1).map((v, i) => {
      const dx = width / 11, dy = series[line % 2][i + 1] - v, length = Math.hypot(dx, dy);
      return <View key={`${line}-${i}`} style={{ position: 'absolute', left: i * dx + (dx - length) / 2, top: 90 - (v + series[line % 2][i + 1]) / 2, width: length, height: 2.5, borderRadius: 2, backgroundColor: color, transform: [{ rotate: `${-Math.atan2(dy, dx)}rad` }] }} />;
    }))}
    <Text style={d.graphNote}>Иллюстрация динамики</Text>
  </View>;
}
export default function Dashboard({ hasData }: { hasData: boolean }) {
  if (!hasData) return <Card title="Показатели пока не подключены"><Text style={d.muted}>Для новой клиники нет данных рабочего стола директора. Выберите другую клинику для просмотра примера.</Text></Card>;
  return <>
    <View style={d.period}><Text style={d.periodLabel}>Рабочий стол директора</Text><Text style={d.muted}>Май 2024 · пример со скриншота</Text></View>
    <Card title="Счета и оплаты">
      <View style={d.legend}><Text style={[d.legendText, { color: '#8B24B2' }]}>● Счета</Text><Text style={[d.legendText, { color: '#207AE5' }]}>● Оплаты</Text></View>
      <Metric label="Сегодня" value={rub(2350)} large />
      <View style={d.row}><Metric label="За май" value={rub(2789140)} /><Metric label="Среднее за день" value={rub(151520)} /></View>
      <View style={d.forecast}><Text style={d.muted}>Прогноз на месяц</Text><Text style={d.forecastValue}>{rub(4920722)}</Text></View>
      <Trend colors={['#207AE5', '#8B24B2']} /><Text style={d.note}>Числа перенесены с выбранного блока скриншота; отдельные суммы оплат не предоставлены.</Text>
    </Card>
    <Card title="Предварительная запись">
      <View style={d.row}><Metric label="Сейчас, часов" value="927" large /><Metric label="Изменение за сегодня" value="−12 ч" /></View>
      <View style={d.forecast}><Text style={d.muted}>Среднее за май</Text><Text style={d.forecastValue}>986 ч</Text></View>
      <Trend colors={['#30B34A', '#207AE5']} />
    </Card>
    <Card title="Конверсия первичных обращений">
      <View style={d.forecast}><Text style={d.muted}>Сквозная конверсия</Text><Text style={d.forecastValue}>0%</Text></View>
      <Text style={d.note}>Период на исходном скриншоте: 30 дней</Text>
      {([['Записи на приём', 40, '#30B34A'], ['Состоявшиеся приёмы', 60, '#30B34A'], ['Заполненные осмотры', 10, '#FFAD12'], ['Осмотры с ИИ', 1, '#F15B64']] as const).map(([label, value, color]) => <View key={label} style={d.funnelRow}><View style={d.row}><Text style={d.funnelLabel}>{label}</Text><Text style={d.percent}>{value}%</Text></View><View style={d.track}><View style={{ width: `${value}%`, height: 5, backgroundColor: color, borderRadius: 4 }} /></View></View>)}
      <Text style={d.note}>Проценты отдельных этапов показаны как на скриншоте; общий показатель не пересчитывается без исходных данных.</Text>
    </Card>
    <Card title="Счета по направлениям">
      <Text style={d.muted}>За май · тыс. ₽</Text>
      <View style={d.row}><Text style={d.tableHeading}>Направление / сейчас</Text><Text style={d.tableHeading}>Прогноз</Text></View>
      {directions.map(([label, value, forecast, color]) => <View key={label} style={d.direction}><View style={d.row}><Text style={d.funnelLabel}>{label}</Text><Text style={d.muted}>{forecast.toLocaleString('ru-RU')}</Text></View><View style={d.row}><View style={d.directionTrack}><View style={{ height: 6, borderRadius: 4, width: `${value / 1297.5 * 100}%`, backgroundColor: color }} /></View><Text style={d.directionValue}>{value.toLocaleString('ru-RU')}</Text></View></View>)}
    </Card>
    <Card title="Приёмы первичных пациентов">
      <Metric label="Сегодня" value="0" large /><View style={d.row}><Metric label="За май" value="108" /><Metric label="Среднее за день" value="8" /></View><View style={d.forecast}><Text style={d.muted}>Прогноз на месяц</Text><Text style={d.forecastValue}>263</Text></View>
      <View style={d.legend}><Text style={[d.legendText, { color: '#685047' }]}>● Обращения</Text><Text style={[d.legendText, { color: '#30B34A' }]}>● Добавлено</Text><Text style={[d.legendText, { color: '#FB8709' }]}>● Отменено</Text></View>
      <Trend colors={['#685047', '#30B34A', '#FB8709']} />
    </Card>
    <Card title="Долги и авансы">
      <Metric label="Долги сейчас" value={rub(4371820)} large /><View style={d.row}><Metric label="Изменение за сегодня" value="0 ₽" /><Metric label="Изменение за май" value="+900 ₽" /></View>
      <View style={d.legend}><Text style={[d.legendText, { color: '#DF0050' }]}>● Долги</Text><Text style={[d.legendText, { color: '#30B34A' }]}>● Авансы</Text></View>
      <Trend colors={['#DF0050', '#30B34A']} /><Text style={d.note}>Отдельная сумма авансов на скриншоте не указана.</Text>
    </Card>
  </>;
}
const d = StyleSheet.create({
  period: { gap: 4, marginVertical: 4 }, periodLabel: { color: '#082D40', fontSize: 20, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, gap: 16, borderWidth: 1, borderColor: '#E3EAF0' }, title: { color: '#082D40', fontSize: 17, fontWeight: '700' },
  muted: { fontSize: 12, color: '#748895', lineHeight: 18 }, metric: { flex: 1, gap: 5, minWidth: 0 }, value: { color: '#082D40', fontSize: 19, fontWeight: '600' }, large: { fontSize: 30, letterSpacing: -0.8 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  forecast: { backgroundColor: '#F4F7FA', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }, forecastValue: { color: '#263F4F', fontWeight: '600', fontSize: 17 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, legendText: { fontSize: 12 }, note: { fontSize: 11, lineHeight: 17, color: '#748895' },
  trend: { height: 110, overflow: 'hidden', marginTop: 2 }, grid: { position: 'absolute', height: 1, backgroundColor: '#EDF2F6', width: '100%' }, graphNote: { position: 'absolute', bottom: 0, color: '#8A9DAA', fontSize: 10 },
  funnelRow: { gap: 10 }, funnelLabel: { color: '#365262', fontSize: 13, flex: 1 }, percent: { color: '#082D40', fontSize: 21, fontWeight: '600' }, track: { backgroundColor: '#F0F4F7', borderRadius: 4, height: 5 },
  tableHeading: { color: '#748895', fontSize: 11 }, direction: { gap: 8 }, directionTrack: { flex: 1, backgroundColor: '#F0F4F7', borderRadius: 4 }, directionValue: { color: '#082D40', fontSize: 15, fontWeight: '600', minWidth: 62, textAlign: 'right' },
});
