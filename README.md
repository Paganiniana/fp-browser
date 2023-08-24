# FP Browser

This is a project to recreate the browser from the [browser.engineer](http://browser.engineering/) project, by Pavel Panchekha & Chris Harrelson (2023). It uses Typescript instead of loosey-goosey Python, as a warm up for larger browser projects. 

# Outline

The plot of our browser is broken down into three acts:

#### I. Turning a URL into an HTTP request
#### II. Making that HTTP **request**, by whatever means necessary
#### III. Making heads/tails of the HTTP **response**
#### IV. Displaying said [Response](#responses)

### Responses

This is not so much a climax as it is a never-ending sequel. Not so much *Macbeth*, as *Henry the VI*. We need to...

1. Determine the type 
2. Display the type

In the event of an HTML response, we need to...

1. Construct the DOM
2. Start painting styles,
3. Start running any JS we run into, which is a whole world unto itself.

# Progress

These are the features included/recommended as part of Pavel & Harrelson (2023).

### Chapter 1
- [x] Connecting to a server
- [x] Requesting Information
- [x] Request and Response
- [x] Display the HTML
- [x] Encrypted connections

***Exercises:***

- [x] HTTP/1.1
- [ ] File URLs    
- [ ] data schemes
- [ ] body tag
- [ ] entities
- [ ] view-source
- [ ] compression (gzip)
- [ ] Redirects
- [ ] Caches

### Chapter 2
- [x] Drawing to the Window
- [x] Laying out the text
- [x] Scrolling text
- [x] Reacting to the user
- [x] Faster Rendering

***Exercises:***
- [ ] Line Breaks
- [ ] Mouse Wheel
- [ ] Emoji
- [ ] Resizing
- [ ] Zoom

### Chapter 3
- [x] What is a font?
- [x] Measuring Text
- [x] Measure by word  
- [x] Styling Text
- [ ] A layout object 
- [ ] Text of different sizes
- [ ] Faster text layout

***Exercises***
- [ ] Centered Text
- [ ] Superscripts
- [ ] Soft Hyphens
- [ ] Small caps
- [ ] Preformatted text 

# References

Pavel, P., & Harrelson, C. (2023). *Web Browser Engineering* Browser.Engineering https://browser.engineering/index.html 