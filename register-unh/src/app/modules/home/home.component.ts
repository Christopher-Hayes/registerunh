import { Component, OnInit, HostListener } from '@angular/core';
import { GetfireService } from '../../services/getfire.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchVisible = true;
  crseHighlight = null;
  hoverProf = null;

  // Only show Saturday and Sunday
  sat = false;
  sun = false;
  sections: any[] = [];

  // Selected courses (with a unique set of times)
  myCourses = [];
  myTimes = [];

  // 'cache' professor data
  prof_name = [];
  prof_data = new Map();

  shortDays = ['M', 'T', 'W', 'R', 'F']; // Dynamically add Sunday(S),Saturday(A)
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
    console.log('[home component] filterSec() time=', time);

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

  stopHighlight() {
    this.crseHighlight = null;
  }

  toggleSearch() {
    console.log('[home component] toggleSearch()');

    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) {
      // Reset text
      (<HTMLInputElement>document.getElementById('courseSearch')).value = '';
      // Styling
      document.getElementById('courseSearch').classList.remove('hidden');
      // Cursor focus
      this.focusSearch();
    } else {
      document.getElementById('courseSearch').classList.add('hidden');
      this.removePreviews();
    }
  }
  focusSearch() {
    console.log('[home component] focusSearch()');

    document.getElementById('courseSearch').focus();
    (<HTMLInputElement>document.getElementById('courseSearch')).select();
  }

  addClass(sec) {
    console.log('[home component] addClass() sec=', sec);

    for (const c of this.myCourses) {
      if (c.crn === sec.crn) {
        return;
      }
    }
    console.log('add ', sec);
    this.myCourses.push(sec);
    if (!this.myTimes.includes(sec.starttime) && sec.starttime !== '') {
      console.log('add time');
      this.myTimes.push(sec.starttime);
      this.myTimes.sort(function (a, b) { return Date.parse('01/01/2013 ' + a) - Date.parse('01/01/2013 ' + b); });
    }
  }

  updatePreview() {
    console.log('[home component] updatePreview()');

    this.removePreviews();

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
          const time = dx['time='];
          const starttime = time.substr(0, time.indexOf('-'));
          const endtime = time.substr(time.indexOf('-') + 1);
          const length = Date.parse('01/01/2013 ' + endtime) - Date.parse('01/01/2013 ' + starttime);
          let min = length / 60000;
          const hrs = Math.floor(min / 60);
          min -= hrs * 60;
          const secObj = {
            title: dx['title='],
            crn: dx['crn='],
            crse: dx['crse='],
            subj: dx['subj='],
            sec: dx['sec='],
            date: dx['date='],
            days: dx['days='],
            startdate: dx['startdate='],
            enddate: dx['enddate='],
            pdate: dx['date='],
            instructor: dx['instructor='],
            instructorfirst: dx['instructor='].substr(0, dx['instructor='].indexOf(' ')),
            instructorlast: dx['instructor='].substr(dx['instructor='].lastIndexOf(' ') + 1),
            plocation: dx['location='],
            time: dx['time='],
            starttime: starttime,
            endtime: endtime,
            length: hrs + ' hr' + (hrs > 1 ? 's ' : ' ') + (min > 0 ? (min + ' min') : ''),
            preview: false
          };

          // Set instructor data
          this.setProf(secObj.instructor, secObj.instructorfirst, secObj.instructorlast);

          // Push object to list of courses
          newSec.push(secObj);

          // Preview section
          const previewSec = {secObj}.secObj;
          previewSec.preview = true;
          this.addClass(previewSec);
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

  removePreviews() {
    // Remove previews
    for (const p of this.myCourses) {
      if ((<any>p).preview) {
        console.log('REMOVE: ', p.title, p.sec);
        const t = (<any>p).starttime;
        this.myCourses.splice(this.myCourses.indexOf(p), 1);

        // Remove preview time if necessary
        let found = false;
        for (const c of this.myCourses) {
          if ((<any>c).starttime === t) {
            found = true;
            break;
          }
        }
        // If not found remove from times array
        if (!found) {
          this.myTimes.splice(this.myTimes.indexOf(t), 1);
        }
      }
    }
  }

  // ------------------------- PROFESSORS --------------------------------------
  setProf(name, first, last) {
    console.log('[home component] setProf() name=', name);

    if (this.prof_data.has(name)) {
      return;
    }

    // Init with template object until object is fetched from db and built
    this.prof_data.set(name, {overall: '', overall_v: 6, take_again: '', diff: '', tags: []});

    // Get data, put in map
    this.getfire.getProf(name, (d) => {
      const profObj = {
        name: name,
        first: first,
        last: last,
        overall: d['overall'],
        overall_v: (d['overall'] !== '-' ? parseFloat(d['overall']) : 6),
        take_again: d['take_again'],
        diff: d['diff'],
        tags: d['tags']
      };
      this.prof_data.set(name, profObj);
    });
  }

  /*
  @HostListener('document:mousedown', ['$event'])
  public documentClick(event: Event): void {
    console.log('[home component] mousedown event catcher');
    this.crseHighlight = null;
  }
  */

}
