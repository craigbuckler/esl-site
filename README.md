# Exeter Student Lets website

Generates the [exeter-student-lets.co.uk](https://www.exeter-student-lets.co.uk/) website:

## Configure

Install modules:

```bash
npm i
```

Create an `.env` file that sets:

```ini
API_URL="<data-source>"
API_TOKEN="<secret=key>"

# development data caching
API_CACHE=./_cache/
API_CACHE_MINS=600
```


## Build

```bash
# development
npm start

# production
npm run build
```
