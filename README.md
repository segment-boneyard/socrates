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

## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```


Copyright (C) 2012 [Ilya Volodarsky](https://twitter.com/ivolo) and [Ian Storm Taylor](https://twitter.com/ianstormtaylor)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.