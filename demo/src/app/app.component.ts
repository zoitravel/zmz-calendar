import { Component } from '@angular/core';
import { CalendarState, State, STATES } from 'zmz-calendar';

import { subDays, addYears, isBefore, addDays, endOfMonth, startOfDay, startOfMonth, isAfter, getDay } from 'date-fns';

const today = new Date();
today.setHours(0, 0, 0 , 0);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  date: string;
  state: CalendarState;
  config = {
    theme: 'form',
    locale: 'es',
    weekDayClickable: false,
    completeMonths: true,
    validRange: {
      from: subDays(today, 1),
      to: addYears(today, 1)
    },
    navigationStrategy: 'validRange'
  };
  private _selectMonth = true;
  month: number;
  year: number;

  constructor() {
    const dates = this.dates();
    this.state = new CalendarState(dates, STATES.SELECTABLE);
  }

  onDateSelected(date: Date) {
    const isDisabled = this.state.has(date, STATES.DISABLED);
    if (!isDisabled) {
      const isSelectable = this.state.has(date, STATES.SELECTABLE);
      const isNotSelectable = this.state.has(date, STATES.NOT_SELECTABLE);

      if (isSelectable) {
        this.state.remove(date, STATES.SELECTABLE);
        this.state.set(date, STATES.NOT_SELECTABLE);
      } else if (isNotSelectable) {
        this.state.remove(date, STATES.NOT_SELECTABLE);
        this.state.set(date, STATES.SELECTABLE);
      }
    }
  }

  onWeekDaySelected(day: number) {
    const days = this.getMonth(this.month, this.year).filter(date => getDay(date) === day);
    const isUnAvailable = days.findIndex(d => this.state.has(d, STATES.UNAVAILABLE)) !== -1;

    if (isUnAvailable) {
      this.remove(days, STATES.UNAVAILABLE);
      this.set(days, STATES.AVAILABLE);
    } else {
      this.remove(days, STATES.AVAILABLE);
      this.set(days, STATES.UNAVAILABLE);
    }
  }

  dates() {
    let start = new Date(today.getTime());
    const aYear = addYears(start, 1);

    const dates = [];

    while (isBefore(start, aYear)) {
      dates.push(new Date(start.getTime()));
      start = addDays(start, 1);
    }

    return dates;
  }

  monthChange({month, year}) {
    this.month = month;
    this.year = year;
  }

  get selectMonth() { return this._selectMonth; }
  set selectMonth(value: boolean) {
    this._selectMonth = value;
    const dates = this.getMonth(this.month, this.year);

    if (value) {
      this.remove(dates, STATES.UNAVAILABLE);
      this.set(dates, STATES.AVAILABLE);
    } else {
      this.remove(dates, STATES.AVAILABLE);
      this.set(dates, STATES.UNAVAILABLE);
    }
  }

  set(dates: Date[], state: State) {

    dates.forEach((date) => {
      if (!this.state.has(date, STATES.DISABLED)) {
        this.state.set(date, state);
      }
    });
  }

  remove(dates: Date[], state: State) {

    dates.forEach((date) => {
      if (!this.state.has(date, STATES.DISABLED)) {
        this.state.remove(date, state);
      }
    });
  }

  private getMonth(month: number, year: number) {
    let startMonth = startOfDay(startOfMonth(new Date(year, month - 1)));
    const endMonth = startOfDay(endOfMonth(new Date(year, month - 1)));

    const result: Date[] = [];
    while (!isAfter(startMonth, endMonth)) {
      const curr = new Date(startMonth.getTime());
      result.push(curr);

      startMonth = addDays(startMonth, 1);
    }

    return result;
  }
}

