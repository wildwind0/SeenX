# SeenX

A browser extension that locally and automatically captures, indexes, categorizes, and searches a user's browsing history on X (formerly Twitter) without requiring login, cloud sync, or manual saving.

## Language

**Post**:
Any standalone unit of content published on X, including standard short posts, longform articles, videos, and media cards.
_Avoid_: Tweet, update, status

**Article**:
An X Longform publication with formatted rich text, headings, and embedded media, distinct from standard short posts.
_Avoid_: Blog, note, long tweet

**Post Type**:
The deterministic structural format of a Post, classified into Standard Post, Article, Video, Quote, or Thread.
_Avoid_: Category, genre, topic

**Impression**:
A passive browsing event where a Post appears within the browser viewport for a qualifying minimum duration and visibility threshold.
_Avoid_: View, scroll-by, glance

**Engagement**:
An active interaction event where a user explicitly opens a Post details page, expands an Article, plays media, or opens external links.
_Avoid_: Click, action

**Capture Rule**:
The configurable criteria determining whether a Post qualifies for ingestion into Browsing History.
_Avoid_: Filter, preference

**Capture Mode**:
The active operating preset governing capture sensitivity, either `All Qualifying` or `Engaged Only`.
_Avoid_: Logging level, setting

**Dwell Time Threshold**:
The minimum continuous duration a Post must remain visible within the viewport to qualify as an Impression.
_Avoid_: Delay, timer, wait time

**Browsing History**:
The searchable, categorized local collection of Post records indexed chronologically along with their capture metadata.
_Avoid_: Cache, bookmark archive, log

**Side Panel**:
The native browser sidebar surface opened by default upon clicking the extension action icon for quick access to recent history while browsing.
_Avoid_: Popup window, floating widget

**Dashboard**:
The dedicated full-page management tab providing advanced timeline filtering, deep search, full article reader, and data management.
_Avoid_: Admin page, settings tab

**Reader View**:
A dedicated distraction-free reading interface within the Dashboard for reading full X Articles and longform posts offline.
_Avoid_: Detail modal, article viewer

**Star**:
A user-applied flag marking a Post as an explicit favorite for immediate retrieval and filtering.
_Avoid_: Like, bookmark, pin

**Intraday Timeline**:
The continuous minute-by-minute progression of Post browsing counts recorded within the current calendar day.
_Avoid_: Hourly chart, daily log, today's graph

**Activity Heatmap**:
The calendar grid visualizing daily captured Post volume across weeks or months.
_Avoid_: Contribution graph, streak calendar, commit map

**Daily Recap Card**:
An exportable visual card summarizing a single day's browsing volume, post type composition, and intraday progression curve.
_Avoid_: Daily report, stat screenshot, today snapshot

**Activity View Mode**:
The active presentation state of the activity widget, toggling between `Today` (Intraday Timeline) and `Calendar` (Activity Heatmap).
_Avoid_: Chart tab, display view, widget state
