# mobile-web-study

The code from this repository can be used to detect if a website has a mobile friendly version, is responsive or adaptive, has an application in the App Store or what CMSes it uses. It also verifies the mobile page score and page size by using [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/).

The requests are done using an iPhone user agent.

Mobile redirects
----------------
The first thing to check is if a website redirects to a different mobile URL (utils/handle_redirect.js). The check is performed using PhantomJS and its page.onNavigationRequested method. Some websites do not handle the iPhone6 user agent well, so for this check we are using an iPhone5 user agent.

The PhantomJS script (utils/libs/redirect.js) is a modified version of the one used by [screenshot-stream](https://github.com/kevva/screenshot-stream). It will return the url even if the page fails to load (for some websites PhantomJS will end with a 'Segmentation fault' error). The onNavigationRequested method is needed because [PhantomJS doesn't follow some redirects](https://github.com/ariya/phantomjs/issues/10389). 

Responsive
----------
By making a screenshot of a website using PhantomJS, we can compare its size with the expected size of an iPhone6 view (utils/responsive.js).

PageSpeed Insights
------------------
The [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v1/getting_started) is used to determine the mobile score of a website and its total size in bytes (utils/page_insights.js).

Adaptive, native apps and CMSes
-------------------------------
If a website doesn't have an associated mobile friendly website, we can check if it serves different content for a mobile user agent compared to a desktop user agent (utils/mobile_friendly.js). To prevent false positives, the website is considered adaptive only if the source differs by a number of lines (limit is set to 150 lines, but it can be easily changed).

The presence of a native app is checked by using [SmartApp Banners](http://smartappbanners.com/) meta tags. This method is not 100% efficient as some website do not use SmartApp Banners and are marketing their apps in a different way.

The CMSes used by a website are retrieved with the help of the [Wappalyzer's](https://wappalyzer.com/) NodeJS plugin.

Processing requests
-------------------
The process.js file reads multiple domains from a MongoDB database and attempts to detect the mobile properties for each. Although it handles a single domain at a time and doesn't take advantage of NodeJS's async requests, this limitation was introduced to prevent [memory leaks](https://github.com/joyent/node/issues/5108) caused by some NodeJS packages.

