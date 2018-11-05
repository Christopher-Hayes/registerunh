import { Injectable } from '@angular/core';
// const firebase = require('firebase');
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GetfireService {
  private firestore;

  constructor() {
    // Init Firebase
    const config = {
      apiKey: 'AIzaSyBt9-ohLmgbW59jFKSEcfowPMipp6sgRHQ',
      authDomain: 'registerunh.firebaseapp.com',
      databaseURL: 'https://registerunh.firebaseio.com',
      projectId: 'registerunh',
      storageBucket: 'registerunh.appspot.com',
      messagingSenderId: '658309918629'
    };
    firebase.initializeApp(config);
    this.firestore = firebase.firestore();
    const settings = {timestampsInSnapshots: true};
    this.firestore.settings(settings);
    /*this.firebase.firestore().enablePersistence().then(function() {
      return this.firebase.auth().signInAnonymously();
    });*/
  }

  // Get all sections of a certain course
  getSections(subj: string, crse: string, term: string = '201901', callback) {
    console.log('[Getfire Service] getSections() subj=', subj, 'crse=', crse);

    // Create a query against the collection
    const crseRef = this.firestore.collection('courses/' + term + '/courses');
    const queryRef = crseRef.where('subj=', '==', subj).where('crse=', '==', crse).get()
      .then(snapshot => {
        if (!snapshot.empty) {
          callback(snapshot.docs);
        } else {
          callback(null);
        }
      })
      .catch(err => {
        console.log('[Getfire Service] getSections() - Error getting documents', err);
      });
  }

  // Get all course data of a certain section
  getSectionData(crn: string, callback) {
    console.log('[Getfire Service] getSectionData() crn=', crn);

  }
}
