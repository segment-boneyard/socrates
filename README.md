# Socrates
Socrates is a realtime [Markdown](http://github.github.com/github-flavored-markdown/) editor and previewer. [Check out the demo!](http://socrates.io)

Although it updates in real time, its not a perfect etherpad. It behaves best when edited by a single person at a time, but can then be shared with anyone you want.

Socrates is designed to work without a server. It can be hosted on Github, S3, DreamHost, etc.

## Running your Own
Sign up for your own [Firebase](https://firebase.com), and change to your account's url in [socrates.js](https://github.com/segmentio/socrates/blob/master/socrates.js). Also, change the paths in index.html to reference your local files.

To run the local server for development:
```javascript
node server.js
```