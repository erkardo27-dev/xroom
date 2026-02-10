export type MongolianEvent = {
    name: string;
    startDate: string; // ISO format YYYY-MM-DD
    endDate: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
};

export const MONGOLIAN_EVENTS: MongolianEvent[] = [
    {
        name: 'Цагаан сар',
        startDate: '2026-02-17',
        endDate: '2026-02-21',
        impact: 'high',
        description: 'Монголын уламжлалт Сар шинийн баяр. Зочид буудлын ачаалал эрс ихэсдэг.'
    },
    {
        name: 'Олон улсын эмэгтэйчүүдийн өдөр',
        startDate: '2026-03-08',
        endDate: '2026-03-08',
        impact: 'medium',
        description: 'Мартын 8-ны баяр. Оройн цагаар ачаалал ихэсдэг.'
    },
    {
        name: 'Эх үрсийн баяр',
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        impact: 'medium',
        description: 'Хүүхдийн баяр. Дотоодын аялагчид нэмэгддэг.'
    },
    {
        name: 'Үндэсний их баяр наадам',
        startDate: '2026-07-10',
        endDate: '2026-07-16',
        impact: 'high',
        description: 'Наадмын баяр. Зочид буудлууд бүрэн дүүрч, үнэ хамгийн дээд түвшинд хүрдэг.'
    },
    {
        name: 'Үндэсний эрх чөлөө, тусгаар тогтнолоо сэргээсний баяр',
        startDate: '2026-12-29',
        endDate: '2026-12-29',
        impact: 'low',
        description: 'Тусгаар тогтнолын өдөр.'
    },
    {
        name: 'Шинэ жил',
        startDate: '2026-12-30',
        endDate: '2027-01-02',
        impact: 'high',
        description: 'Шинэ жилийн баяр. Захиалга болон үнэ нэмэгддэг.'
    }
];

export function getEventsForPeriod(start: Date, end: Date): MongolianEvent[] {
    return MONGOLIAN_EVENTS.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return (eventStart <= end && eventEnd >= start);
    });
}
