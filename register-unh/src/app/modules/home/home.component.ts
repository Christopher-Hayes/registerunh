import { Component, OnInit, HostListener } from '@angular/core';
import { GetfireService } from '../../services/getfire.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sections = [];
  myCourses = [];
  myTimes = [];
  shortDays = ['S', 'M', 'T', 'W', 'R', 'F', 'A'];
  longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  times = [ '08:00 am',
                    '09:25 am',
                    '10:50 am',
                    '12:15 pm',
                    '01:40 pm',
                    '03:05 pm',
                    '04:30 pm',
                    '06:00 pm'];
  oldtimes = [ '08:00 am-9:15 am',
                    '09:25 am-10:40 am',
                    '10:50 am-12:05 pm',
                    '12:15 pm-1:30 pm',
                    '01:40 pm-02:55 pm',
                    '03:05 pm-04:20 pm',
                    '04:30 pm-04:45 pm',
                    '06:00 pm-08:40 pm'];

  constructor(private getfire: GetfireService) { }

  ngOnInit() { }

  filterSec(time) {
    const weekCrse = [[], [], [], [], [], [], []];
    for (let d = 0; d < this.shortDays.length; d++) {
      for (const c of this.myCourses) {
        if (c.days.includes(this.shortDays[d])) {
          console.log('includes: sec=', c);
          weekCrse[d].push(c);
        }
      }
    }
  }

  addClass(sec) {
    for (const c of this.myCourses) {
      if (c.crn === sec.crn) {
        return;
      }
    }
    console.log('add ', sec);
    this.myCourses.push(sec);
    if (!this.myTimes.includes(sec.starttime)) {
      console.log('add time');
      this.myTimes.push(sec.starttime);
      this.myTimes.sort(function (a, b) { return Date.parse('01/01/2013 ' + a) - Date.parse('01/01/2013 ' + b); });
    }
  }

  updatePreview() {
    const args = (<HTMLInputElement>document.getElementById('courseSearch')).value.toUpperCase().trim().split(' ');
    if (args.length < 2) {
      return;
    } else if (args.length > 3) {
      args.splice(2);
    }
    this.getfire.getSections(args[0], args[1], '201901', (docs) => {
      if (docs === null) {
        this.sections = [];
        return;
      }
      const newSec = [];
      let k = 0;
      docs.forEach((d) => {
        if (d.exists) {
          const dx = d.data();
          const secObj = {
            title: dx['title='],
            crn: dx['crn='],
            crse: dx['crse='],
            sec: dx['sec='],
            date: dx['date='],
            days: dx['days='],
            startdate: dx['startdate='],
            enddate: dx['enddate='],
            pdate: dx['date='],
            instructor: dx['instructor='],
            plocation: dx['location='],
            time: dx['time='],
            starttime: dx['time='].substr(0, dx['time='].indexOf('-'))
          };
          newSec.push(secObj);
        }
        k++;
        if (k === docs.length) {
          if (document.getElementById('courseSearch') === document.activeElement
                || (<HTMLElement>document.activeElement).parentNode === document.getElementById('searchPreview')) {
            this.sections = newSec;
          }
        }
      });
    });
  }

  @HostListener('document:mousedown', ['$event'])
  public documentClick(event: Event): void {
  if (event.target !== document.getElementById('courseSearch') && (<HTMLElement>event.target).parentNode !== document.getElementById('searchPreview')) {
      this.sections = []
    }
  }

}
