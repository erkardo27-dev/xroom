"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Tag } from 'lucide-react';
import { getDay } from 'date-fns';

type RecommendationCardProps = {
  selectedDate: Date;
};

type Recommendation = {
  title: string;
  description: string;
  actionText: string;
};

export function RecommendationCard({ selectedDate }: RecommendationCardProps) {
  const recommendation = useMemo((): Recommendation => {
    const dayOfWeek = getDay(selectedDate); // Sunday=0, Monday=1, etc.

    // Weekdays (Monday - Thursday)
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return {
        title: 'Ухаалаг зөвлөмж',
        description: 'Эдгээр өдрүүдэд ачаалал бага байх хандлагатай байна. Хямдрал зарлаж захиалгаа нэмэгдүүлээрэй.',
        actionText: 'Хямдралтай үнэ тохируулах'
      };
    }
    // Weekends (Friday - Sunday)
    else {
      return {
        title: 'Ухаалаг зөвлөмж',
        description: 'Амралтын өдрүүдэд ачаалал ихсэх төлөвтэй байна. Үнээ ухаалгаар тохируулж, орлогоо нэмэгдүүлээрэй.',
        actionText: 'Үнэ тохируулах'
      };
    }
  }, [selectedDate]);

  const handleActionClick = () => {
    // In a real app, this would open a dialog or navigate to a price management page.
    // For now, we can just show an alert.
    alert('Үнийн тохиргооны хэсэг рүү шилжих үйлдэл энд хийгдэнэ.');
  };

  return (
    <Card className="bg-accent/20 border-accent/30 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-3">
          <div className="p-2 bg-yellow-400/20 rounded-full">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-base font-semibold pt-1">{recommendation.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {recommendation.description}
        </p>
        <Button size="sm" className="w-full" onClick={handleActionClick}>
          <Tag className="mr-2 h-4 w-4" />
          {recommendation.actionText}
        </Button>
      </CardContent>
    </Card>
  );
}
