import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, Platform, ScrollView, StatusBar as NativeStatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Dashboard from './src/Dashboard';
import { Clinic, clinics, competitors, marketGrowth, rankedClinics, revenueHistory } from './src/clinics';

type Page = { screen: 'dashboard' | 'clinics' | 'home' | 'analysis' | 'ranking' | 'company' | 'profile'; companyId?: string };
const names: Record<Page['screen'], string> = { dashboard: 'Мой IDENT', clinics: 'Рынок', home: 'Рынок моей клиники', analysis: 'Анализ конкурентов', ranking: 'Рейтинг', company: 'Компания', profile: 'Профиль' };
const money = (value: number | null) => value === null ? 'Нет данных' : `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ₽`;
function Growth({ value }: { value: number | null }) {
  return <Text style={[s.growth, value !== null && value < 0 && s.negative]}>{value === null ? '—' : `${value < 0 ? '↘' : '↗'} ${value > 0 ? '+' : ''}${value}%`}</Text>;
}
function Button({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[s.button, secondary && s.secondary]}><Text style={s.buttonText}>{title}</Text></TouchableOpacity>;
}
function ClinicCard({ clinic, onPress, active = false, rank }: { clinic: Clinic; onPress: () => void; active?: boolean; rank?: number }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Открыть ${clinic.name}`} onPress={onPress} style={[s.card, active && s.selected]}>
    <View style={s.between}><Text style={s.caption}>{rank ? `№ ${rank} в рейтинге` : clinic.own ? 'Моя клиника' : 'Конкурент'}</Text><Text style={s.caption}>›</Text></View>
    <Text style={s.cardTitle}>{clinic.name}</Text>
    <Text style={s.caption}>{clinic.address}</Text>
    <View style={s.between}><Text style={s.amount}>{money(clinic.revenue)}</Text><Growth value={clinic.growth} /></View>
  </TouchableOpacity>;
}

export default function App() {
  const [history, setHistory] = useState<Page[]>([{ screen: 'dashboard' }]);
  const [selectedId, setSelectedId] = useState('north');
  const [radius, setRadius] = useState(3);
  const [sort, setSort] = useState<'distance' | 'revenue'>('distance');
  const page = history[history.length - 1];
  const clinic = clinics.find(c => c.id === selectedId)!;
  const company = clinics.find(c => c.id === page.companyId) ?? clinic;
  const ranked = rankedClinics();
  const place = ranked.findIndex(c => c.id === clinic.id) + 1;
  const back = () => setHistory(h => h.length > 1 ? h.slice(0, -1) : h);
  const navigate = (screen: Page['screen'], companyId?: string) => setHistory(h => [...h, { screen, companyId }]);
  const root = (screen: 'dashboard' | 'clinics' | 'profile') => setHistory([{ screen }]);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (history.length <= 1) return false;
      setHistory(h => h.slice(0, -1)); return true;
    });
    return () => listener.remove();
  }, [history.length]);
  const nearby = competitors(clinic.id, radius).sort((a, b) => sort === 'distance'
    ? Math.abs(a.distance - clinic.distance) - Math.abs(b.distance - clinic.distance)
    : (b.revenue ?? -1) - (a.revenue ?? -1));
  const delta = clinic.growth === null ? null : clinic.growth - marketGrowth;
  return <View style={s.screen}>
    <StatusBar style="dark" />
    <View style={s.header}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={history.length > 1 ? 'Назад' : 'Мои клиники'} onPress={history.length > 1 ? back : () => root('clinics')} style={s.headerButton}><Text style={s.icon}>{history.length > 1 ? '‹' : '▦'}</Text></TouchableOpacity>
      <Text style={s.headerTitle}>{names[page.screen]}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Профиль" onPress={() => root('profile')} style={s.headerButton}><Text style={s.icon}>◎</Text></TouchableOpacity>
    </View>
    <ScrollView key={`${page.screen}-${page.companyId ?? ''}`} contentContainerStyle={s.content}>
      <Text style={s.demo}>ДЕМО · все компании и показатели вымышлены</Text>
      {page.screen === 'dashboard' && <>
        <Text style={s.section}>Моя клиника</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.wrap}>{clinics.filter(c => c.own).map(c => <TouchableOpacity key={c.id} accessibilityRole="radio" accessibilityState={{ selected: selectedId === c.id }} style={[s.chip, selectedId === c.id && s.activeChip]} onPress={() => setSelectedId(c.id)}><Text style={s.chipText}>{c.name}</Text></TouchableOpacity>)}</ScrollView>
        <Text style={s.caption}>{clinic.address}</Text>
        <Text style={s.caption}>Демонстрация рабочего стола: пример одинаков для подключённых клиник.</Text>
        <Dashboard hasData={clinic.revenue !== null} />
      </>}
      {page.screen === 'clinics' && <>
        <View style={s.card}><Text style={s.caption}>Всего клиник</Text><View style={s.between}><Text style={s.hero}>3</Text><Text style={s.amount}>{money(clinics.filter(c => c.own).reduce((sum, c) => sum + (c.revenue ?? 0), 0))}</Text></View><Text style={s.caption}>Выручка за 2025 · данные 2 из 3 клиник</Text></View>
        <Text style={s.section}>Выберите клинику для просмотра</Text>
        {clinics.filter(c => c.own).map(c => <ClinicCard key={c.id} clinic={c} onPress={() => { setSelectedId(c.id); navigate('home'); }} />)}
      </>}
      {page.screen === 'home' && <>
        <ClinicCard clinic={clinic} onPress={() => root('clinics')} active />
        <Text style={s.section}>Анализ конкурентов</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigate('analysis')} style={s.card}><Text style={s.cardTitle}>Клиники рядом с вами  ›</Text><Text style={s.caption}>Сравните выручку и динамику роста</Text><Text style={s.amount}>{competitors(clinic.id, 3).length} в радиусе 3 км</Text></TouchableOpacity>
        <Text style={s.section}>Рейтинг по выручке за 2025</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigate('ranking')} style={s.card}><Text style={s.cardTitle}>{place ? `№ ${place} из ${ranked.length}` : 'Клиника пока не в рейтинге'}  ›</Text><Text style={s.caption}>Демонстрационная выборка · Санкт-Петербург</Text></TouchableOpacity>
        <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: delta === null ? '#BCCBD6' : delta < -3 ? '#F15B64' : delta > 3 ? '#19BF94' : '#FFA000' }]}>
          <Text style={s.cardTitle}>{delta === null ? 'Скоро появятся данные вашей клиники' : delta > 3 ? 'Вы растёте быстрее рынка' : delta < -3 ? 'Вы растёте медленнее рынка' : 'Вы растёте на уровне рынка'}</Text>
          <View style={s.between}><View><Text style={s.caption}>Рынок РФ</Text><Growth value={marketGrowth} /></View><View><Text style={s.caption}>Ваша клиника</Text><Growth value={clinic.growth} /></View><View><Text style={s.caption}>Разница</Text><Text style={s.amount}>{delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta} п.п.`}</Text></View></View>
        </View>
        <View style={s.banner}><Text style={s.bannerTitle}>Увидеть возможности роста</Text><Text style={s.bannerText}>Изучите клиники рядом и сравните показатели вашей компании.</Text><Button title="Посмотреть конкурентов" onPress={() => navigate('analysis')} /></View>
      </>}
      {page.screen === 'analysis' && <>
        <ClinicCard clinic={clinic} active onPress={() => navigate('company', clinic.id)} />
        <Text style={s.section}>Ваши конкуренты</Text>
        <View style={s.card}><Text style={s.caption}>Радиус поиска · {radius} км</Text><View style={s.wrap}>{[1, 3, 5, 7, 10].map(r => <TouchableOpacity key={r} accessibilityRole="radio" accessibilityState={{ selected: radius === r }} onPress={() => setRadius(r)} style={[s.chip, radius === r && s.activeChip]}><Text style={s.chipText}>{r} км</Text></TouchableOpacity>)}</View></View>
        <View style={s.wrap}>{(['distance', 'revenue'] as const).map(value => <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ selected: sort === value }} onPress={() => setSort(value)} style={[s.chip, sort === value && s.activeChip]}><Text style={s.chipText}>{value === 'distance' ? 'По удалённости' : 'По выручке'}</Text></TouchableOpacity>)}</View>
        {nearby.map(c => <View key={c.id}><Text style={s.caption}>{Math.abs(c.distance - clinic.distance).toFixed(1)} км от вашей клиники</Text><ClinicCard clinic={c} onPress={() => navigate('company', c.id)} /></View>)}
        {!nearby.length && <View style={s.card}><Text style={s.cardTitle}>В этом радиусе клиник не найдено</Text><Text style={s.caption}>Увеличьте радиус поиска.</Text><Button title="Расширить до 10 км" onPress={() => setRadius(10)} /></View>}
      </>}
      {page.screen === 'ranking' && <>
        <Text style={s.section}>Выручка за 2025</Text><Text style={s.caption}>Санкт-Петербург · {ranked.length} компаний с данными</Text>
        <View style={s.card}><Text style={s.cardTitle}>{place ? `Ваша клиника на ${place}-м месте` : 'Для вашей клиники нет данных'}</Text><Text style={s.caption}>{place > 1 ? `До следующего места: ${money(ranked[place - 2].revenue! - clinic.revenue!)}` : place === 1 ? 'Ваша клиника лидирует в выборке' : 'Она появится в рейтинге после получения выручки'}</Text></View>
        {ranked.map((c, i) => <ClinicCard key={c.id} clinic={c} rank={i + 1} active={c.id === clinic.id} onPress={() => navigate('company', c.id)} />)}
      </>}
      {page.screen === 'company' && <>
        <View style={s.card}><Text style={s.caption}>{company.own ? 'Моя клиника' : 'Конкурент'}</Text><Text style={s.section}>{company.name}</Text>{[['Выручка за 2025', money(company.revenue)], ['Адрес', company.address], ['Реквизиты', company.inn], ['Открытие', company.opened]].map(([label, value]) => <View key={label} style={s.detail}><Text style={s.caption}>{label}</Text><Text style={s.body}>{value}</Text></View>)}</View>
        <Text style={s.section}>Выручка по годам</Text>
        <View style={s.card}>
          {revenueHistory(company).length ? <><View style={s.chart}>{revenueHistory(company).map((value, i, values) => <View key={i} style={s.barColumn}><Text style={s.chartValue}>{value.toFixed(1)}</Text><View style={[s.bar, { height: 110 * value / Math.max(...values) }]} /><Text style={s.caption}>{2023 + i}</Text></View>)}</View><Text style={s.caption}>млн ₽ · иллюстративная динамика</Text></> : <><Text style={s.cardTitle}>Выручка пока не опубликована</Text><Text style={s.caption}>Показатели появятся после подключения данных.</Text></>}
        </View>
        <Text style={s.section}>Клиники рядом</Text>
        {competitors(company.id, 3).map(c => <ClinicCard key={c.id} clinic={c} onPress={() => navigate('company', c.id)} />)}
      </>}
      {page.screen === 'profile' && <>
        <View style={s.card}><Text style={s.section}>Демо-пользователь</Text><Text style={s.caption}>Учредитель · ZubApp</Text></View>
        <View style={s.card}><Text style={s.cardTitle}>О прототипе</Text><Text style={s.body}>Обзор клиник, анализ конкурентов и рейтинг по выручке. Данные вымышлены, подключение к серверу и авторизация ещё не реализованы.</Text></View>
        <Button title="Вернуться к моим клиникам" onPress={() => root('clinics')} />
      </>}
    </ScrollView>
    <View style={s.tabs}>{(['dashboard', 'clinics', 'profile'] as const).map(tab => {
      const active = tab === 'dashboard' ? page.screen === 'dashboard' : tab === 'profile' ? page.screen === 'profile' : !['dashboard', 'profile'].includes(page.screen);
      return <TouchableOpacity key={tab} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => root(tab)} style={s.tab}>
        {tab === 'dashboard' ? <View style={[s.identIcon, active && s.identIconActive]}><Text style={[s.check, active && s.activeTab]}>✓</Text></View> : tab === 'clinics' ? <View style={s.marketIcon}>{[10, 16, 23].map((height, i) => <View key={i} style={{ width: 4, height, borderRadius: 2, backgroundColor: active ? '#082D40' : '#91A2AF' }} />)}</View> : <View style={[s.profileIcon, active && s.identIconActive]}><View style={[s.profileDot, { backgroundColor: active ? '#082D40' : '#91A2AF' }]} /></View>}
        <Text style={[s.tabLabel, active && s.activeTab]}>{tab === 'dashboard' ? 'Мой IDENT' : tab === 'clinics' ? 'Рынок' : 'Профиль'}</Text>
      </TouchableOpacity>;
    })}</View>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDF2F6', paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 54, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingVertical: 2, borderBottomWidth: 1, borderColor: '#E1E8EE' },
  headerButton: { padding: 12, minWidth: 48, alignItems: 'center' }, icon: { fontSize: 24, color: '#092C3E' }, headerTitle: { fontSize: 17, fontWeight: '700', color: '#092C3E' },
  content: { padding: 16, gap: 12, paddingBottom: 30 }, demo: { fontSize: 10, color: '#8196A4', textAlign: 'center' },
  card: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#E1E8EE' }, selected: { borderColor: '#AED01C', borderWidth: 2 },
  caption: { fontSize: 12, color: '#687F8F', lineHeight: 18 }, cardTitle: { fontSize: 16, fontWeight: '700', color: '#092C3E' }, section: { fontSize: 17, fontWeight: '700', color: '#092C3E', marginTop: 8 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, amount: { color: '#092C3E', fontSize: 18, fontWeight: '700' }, hero: { color: '#092C3E', fontSize: 32, fontWeight: '700' },
  growth: { color: '#09B78B', fontSize: 17, fontWeight: '600' }, negative: { color: '#EF5664' },
  banner: { padding: 20, backgroundColor: '#243747', borderRadius: 16, gap: 14 }, bannerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' }, bannerText: { color: '#C3D0DB', lineHeight: 22 },
  button: { backgroundColor: '#AED01C', padding: 14, borderRadius: 10, alignItems: 'center', minHeight: 48 }, secondary: { backgroundColor: '#E8EEF3' }, buttonText: { color: '#173244', fontWeight: '600', fontSize: 14 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE4EB' }, activeChip: { backgroundColor: '#E9F4BD', borderColor: '#AED01C' }, chipText: { color: '#173244', fontSize: 13 },
  detail: { borderTopWidth: 1, borderColor: '#EDF2F6', paddingTop: 10, gap: 4 }, body: { color: '#173244', fontSize: 14, lineHeight: 22 },
  chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 10 }, barColumn: { alignItems: 'center', gap: 6 }, bar: { width: 44, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#AED01C' }, chartValue: { color: '#173244', fontSize: 12 },
  tabLabel: { fontSize: 11, color: '#91A2AF', fontWeight: '600' }, identIcon: { width: 24, height: 24, borderWidth: 2, borderColor: '#91A2AF', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, identIconActive: { borderColor: '#082D40' }, check: { fontSize: 18, fontWeight: '800', color: '#91A2AF', lineHeight: 21 }, marketIcon: { height: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 3 }, profileIcon: { height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: '#91A2AF', alignItems: 'center', justifyContent: 'center' }, profileDot: { width: 8, height: 8, borderRadius: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E1E8EE', paddingTop: 8 }, tab: { flex: 1, alignItems: 'center', padding: 6, gap: 2 }, tabIcon: { fontSize: 24, color: '#91A2AF' }, activeTab: { color: '#092C3E' },
});
