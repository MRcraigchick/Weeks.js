import CalendarDates from './lib/CalendarDates.js';

export default class Weeks extends CalendarDates {
  // This class is used for generating a week based on a starting date and then the week can be incremented or decremented
  // with the incrementWeek() or decrementWeek() methods
  // or returned to the week containing the starting date with the resetWeek() method.
  //
  // The constructor takes in a date in the format "yyyy-mm-dd" or can be left blank to start from todays date.
  //
  // Weeks is an extension of the CalendarDates class to give accurate date and weekday mapping within a
  // Gregorian calendar year and of the methods of CalendarDates can be accessed to be used for accurate date proccessing
  // and calendar generating.
  //
  // The private #startDate object will be a key value representation of the date passed into the constructor when Weeks
  // is initiated
  //
  // When methods are called to change the date value, the results will be stored in the private #currentDate object keeping
  // the #startDate untouched for ease on reverting back to the starting date later after date modifications.
  //
  // On initiation, the #currentDate will be set to the Sunday of the current week mapped from the starting date
  // and all days of that week will be stored in the week object where the week day name is the key and
  // the values as a another object containing { day: dd, month: monthname, year: yyyy, startDate: false },
  // { startDate: true } will be set if the day of the week is the day set in the startDate object.

  // PRIVATE FIELDS
  #startDate;
  #currentDate;
  #indices;
  #calendar;

  constructor(startDate = 'today') {
    // super() Calls the constructor of CalandarDates
    super();

    // At first the #startDate will be stored as a parsed version from the result of the standard Date() constructor
    // then will be set to a mirrored format of the #currentDate object by using the private #saveStartDate() method.

    this.#startDate =
      startDate === 'today'
        ? new Date().toString('utf8').split(' ').splice(0, 4)
        : new Date(startDate).toString('utf8').split(' ').splice(0, 4);
    this.#currentDate = {
      weekday: this.#startDate[0],
      day: Number(this.#startDate[2]),
      month: this.#startDate[1],
      year: Number(this.#startDate[3]),
    };
    this.week = {};
    this.#calendar = this.getFullCalendarYear(this.#currentDate.year);
    this.#indices = {};
    this.#setDateToCalendarDate();
    this.#saveStartDate();
    this.#setCurrentWeek();
  }

  #setCurrentWeek() {
    //PRIVATE METHOD
    //
    // Sets the week object to the week containing the date that is stored in the #currentDate object then the
    // #currentDate object will be set to the Sunday of that week

    this.#buildWeek('increment');
  }

  decrementWeek() {
    // Decrements the week object by one week and the #currentDate object will be set to the Sunday of that week

    for (let i = 0; i < 7; i++) {
      this.#decrementDay();
    }
    this.#buildWeek('decrement');
  }

  incrementWeek() {
    // increments the week object by one week and the #currentDate object will be set to the Monday of that week

    for (let i = 0; i < 7; i++) {
      this.#incrementDay();
    }
    this.#buildWeek('increment');
  }

  resetWeek() {
    // Resets the week object to the week containing the starting date
    // and the #currentDate object will be set to the Monday of that week

    this.#currentDate = { ...this.#startDate };
    this.#calendar = this.getFullCalendarYear(this.#currentDate.year);
    this.#setDateToCalendarDate();
    this.#buildWeek('increment');
  }

  getLastDayOfMonth() {
    // Returns the last day of the currentDates month

    return this.#calendar[this.#indices.month][this.#currentDate.month][
      this.#calendar[this.#indices.month][this.#currentDate.month].length - 1
    ].day;
  }

  getMonthFromIndex() {
    // Uses the index value stored in #indices.month to get the month name at that index location within the calendar object

    return Object.keys(this.#calendar[this.#indices.month])[1];
  }

  getDayFromIndex() {
    // Uses the index values stored in #indices and the currentDate.month to get the day number of the current date at
    // that index location within the calendar object

    return this.#calendar[this.#indices.month][this.#currentDate.month][this.#indices.day].day;
  }
  getWeekDayFromIndex() {
    // Uses the index values stored in #indices and the currentDate.month to get the weekday of the current date at
    // that index location within the calendar object

    return this.#calendar[this.#indices.month][this.#currentDate.month][this.#indices.day].weekDay;
  }

  #setDateToCalendarDate() {
    // PRIVATE METHOD
    //
    // This takes the values from the #currentDate object and ensures the values maps
    // directly to the calendar object created by CalendarDates after the date has
    // been modified, if needed, #currentDate will be updated.
    //
    // Indices will be stored in the private #indices object for rapid location of the current month and day
    // within the calendar object.

    this.#convertShortMonthNameToLongMonthName(this.#currentDate.month);
    for (let i = 0; i < this.#calendar.length; i++) {
      const month = this.#calendar[i];
      const monthName = Object.keys(month)[1];
      if (monthName === this.#currentDate.month) {
        this.#currentDate.month = monthName;
        this.#indices.month = i;
        for (let j = 0; j < this.#calendar[i][monthName].length; j++) {
          const day = this.#calendar[i][monthName][j];
          if (day.day === this.#currentDate.day) {
            this.#currentDate.day = day.day;
            this.#indices.day = j;
            this.#currentDate.weekday = this.getWeekDayFromIndex();
            break;
          }
        }
      }
    }
  }

  #buildWeek(direction) {
    // PRIVATE METHOD
    //
    // This builds a week object based on the date from the #currentDate object,
    // The direction argument will determine direction of the week day iteration
    //
    // increment = Monday to Sunday
    // decrement = Sunday to Monday

    if (direction !== 'increment' && direction !== 'decrement') {
      throw new Error('Direction can only be strings "increment" or "decrement"');
    }

    let week = {};
    if (this.#currentDate.weekday !== 'Monday' && direction === 'increment') {
      this.#setDateToThisMonday();
    } else if (this.#currentDate.weekday !== 'Sunday' && direction === 'decrement') {
      this.#setDateToThisSunday();
    }
    week[this.#currentDate.weekday] = { ...this.#currentDate, startDate: false };
    delete week[this.#currentDate.weekday].weekday;
    for (let i = 0; i < 6; i++) {
      direction === 'increment' ? this.#incrementDay() : this.#decrementDay();
      week[this.#currentDate.weekday] = { ...this.#currentDate, startDate: false };
      if (week[this.#currentDate.weekday].day === this.#startDate.day) {
        week[this.#currentDate.weekday].startDate = true;
      }
      delete week[this.#currentDate.weekday].weekday;
    }
    this.week = week;
  }

  #convertShortMonthNameToLongMonthName(shortName) {
    // PRIVATE METHOD
    //
    // Takes the short name of the month generated by the standard js Dates() constructor, eg: Feb , and updates
    // currenDate.month to the long name counter part, eg: Febuary , as all months in the calendar object have there
    // key set to the months long name

    let longName = '';
    if (shortName.length === 3) {
      for (let month of this.getMonthsList()) {
        if (shortName === month.shortName) {
          longName = month.name;
        }
      }
    } else {
      longName = shortName;
    }
    this.#currentDate.month = longName;
  }

  #saveStartDate() {
    // PRIVATE METHOD
    //
    // After initiation of the class, the #currentDate object will hold the first date values representing
    // the starting date.
    // Then the starting date will be stored in the startDate object with this function
    // for ease of access later and will not be modified unlike the #currentDate object which keeps track of
    // any changes made to the date.

    this.#startDate = { ...this.#currentDate };
  }

  #decrementDay() {
    // PRIVATE METHOD
    //
    // Decrements the date by one day and updates the #currentDate object on every day change.
    // If the next day decends into the previous year then the calendar object will be re-mapped to the
    // correct Gregorian calendar of that year

    if (this.#indices.day === 0) {
      if (this.#indices.month === 0) {
        this.#currentDate.year -= 1;
        this.#calendar = this.getFullCalendarYear(this.#currentDate.year);
        this.#indices.month = 11;
        this.#currentDate.month = this.getMonthFromIndex();
        this.#indices.day = this.getLastDayOfMonth() - 1;
        this.#currentDate.day = this.getDayFromIndex();
        this.#setDateToCalendarDate();
        return;
      } else {
        this.#indices.month -= 1;
        this.#currentDate.month = this.getMonthFromIndex();
        this.#indices.day = this.getLastDayOfMonth() - 1;
        this.#currentDate.day = this.getDayFromIndex();
        this.#setDateToCalendarDate();
        return;
      }
    } else {
      this.#indices.day -= 1;
      this.#currentDate.day = this.getDayFromIndex();
      this.#setDateToCalendarDate();
      return;
    }
  }
  #incrementDay() {
    // PRIVATE METHOD
    //
    // increments the date by one day and updates the #currentDate object on every day change.
    // If the next day accends into the next year then the calendar object will be re-mapped to the
    // correct Gregorian calendar of that year

    if (this.#indices.day === this.getLastDayOfMonth() - 1) {
      if (this.#indices.month === 11) {
        this.#currentDate.year += 1;
        this.#calendar = this.getFullCalendarYear(this.#currentDate.year);
        this.#indices.month = 0;
        this.#currentDate.month = this.getMonthFromIndex();
        this.#indices.day = 0;
        this.#currentDate.day = this.getDayFromIndex();
        this.#setDateToCalendarDate();
        return;
      } else {
        this.#indices.month += 1;
        this.#currentDate.month = this.getMonthFromIndex();
        this.#indices.day = 0;
        this.#currentDate.day = this.getDayFromIndex();
        this.#setDateToCalendarDate();
        return;
      }
    } else {
      this.#indices.day += 1;
      this.#currentDate.day = this.getDayFromIndex();
      this.#setDateToCalendarDate();
      return;
    }
  }

  #setDateToThisMonday() {
    // PRIVATE METHOD
    //
    // This will set the current date to the Monday of the current week.
    // If the day is already Monday then no change occures

    if (this.#currentDate.weekday === 'Monday') {
      return;
    } else {
      while (this.#currentDate.weekday !== 'Monday') {
        this.#decrementDay();
      }
    }
  }

  #setDateToThisSunday() {
    // PRIVATE METHOD
    //
    // This will set the current date to the Sunday of the current week.
    // If the day is already Sunday then no change occures.

    if (this.#currentDate.weekday === 'Sunday') {
      return;
    } else {
      while (this.#currentDate.weekday !== 'Sunday') {
        this.#incrementDay();
      }
    }
  }
}
