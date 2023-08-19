# Browser

This is a project to recreate the browser from the [browser.engineer](http://browser.engineering/) project, by Pavel Panchekha & Chris Harrelson. It uses Typescript instead of loosey-goosey Python, as a warm up for larger browser projects. 

# Outline

The plot of our browser is broken down into three acts:

I. Turning a URL into an HTTP request
II. Making that HTTP **request**, by whatever means necessary
III. Making heads/tails of the HTTP **response**
IV. Displaying said [Response](#responses)

# Responses

This is not so much a climax as it is a never-ending sequel. Not so much *Macbeth*, as *Henry the VI*. We need to...

1. Determine the type 
2. Display the type

In the event of an HTML response, we need to...

1. Construct the DOM
2. Start painting styles,
3. Start running any JS we run into, which is a whole world unto itself.
