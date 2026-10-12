export type Clinic = {
  id: string; name: string; address: string; own: boolean; revenue: number | null;
  growth: number | null; distance: number; inn: string; opened: string;
};
// Все компании и показатели вымышлены, включая реквизиты.
export const clinics: Clinic[] = [
  { id: 'north', name: 'ЗУБ • СЕВЕР', address: 'Санкт-Петербург, пр. Просвещения, 24', own: true, revenue: 23.2, growth: 27, distance: 0, inn: 'Демо-компания 001', opened: 'Март 2020' },
  { id: 'center', name: 'ЗУБ • ЦЕНТР', address: 'Санкт-Петербург, ул. Садовая, 18', own: true, revenue: 18.4, growth: 8, distance: 4.2, inn: 'Демо-компания 002', opened: 'Июнь 2021' },
  { id: 'new', name: 'ЗУБ • ПАРК', address: 'Санкт-Петербург, ул. Парковая, 7', own: true, revenue: null, growth: null, distance: 8, inn: 'Демо-компания 003', opened: 'Октябрь 2026' },
  { id: 'med', name: 'ДЕНТАЛЬ • МЕД', address: 'Санкт-Петербург, пр. Просвещения, 30', own: false, revenue: 31.1, growth: 21, distance: 0.6, inn: 'Демо-компания 004', opened: 'Май 2018' },
  { id: 'smile', name: 'УЛЫБКА', address: 'Санкт-Петербург, ул. Есенина, 12', own: false, revenue: 26.8, growth: -5, distance: 1.8, inn: 'Демо-компания 005', opened: 'Август 2019' },
  { id: 'care', name: 'ДЕНТАЛЬ • ЗАБОТА', address: 'Санкт-Петербург, пр. Луначарского, 15', own: false, revenue: 16.2, growth: 14, distance: 3.4, inn: 'Демо-компания 006', opened: 'Январь 2022' },
  { id: 'city', name: 'ДЕНТАЛЬ • СИТИ', address: 'Санкт-Петербург, Выборгское шоссе, 40', own: false, revenue: 42.5, growth: 19, distance: 7.2, inn: 'Демо-компания 007', opened: 'Февраль 2017' },
];
export const marketGrowth = 23;
export function rankedClinics() {
  return clinics.filter(c => c.revenue !== null).sort((a, b) => b.revenue! - a.revenue!);
}
export function competitors(clinicId: string, radius: number) {
  // Демонстрационные расстояния заданы от выбранной клиники.
  const origin = clinics.find(c => c.id === clinicId)?.distance ?? 0;
  return clinics.filter(c => c.id !== clinicId && Math.abs(c.distance - origin) <= radius);
}
export function revenueHistory(clinic: Clinic): number[] {
  if (clinic.revenue === null || clinic.growth === null) return [];
  const previous = clinic.revenue / (1 + clinic.growth / 100);
  return [previous / 1.12, previous, clinic.revenue];
}
