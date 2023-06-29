import scrape from 'website-scraper';

const site_url = process.argv[2]
const directory_to_save = process.argv[3]

const options = {
    urls: [site_url],
    directory: directory_to_save,
    recursive: true,
    prettifyUrls: true,
    filenameGenerator: 'bySiteStructure',
    requestConcurrency: 4,
    maxRecursiveDepth: 4,
    urlFilter: function(url) {
        return url.indexOf(site_url) === 0;
    },
    request: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
        }
    },
};

const startScrape = async  () => {
    scrape(options)
    .catch(e => 
        console.error(e)
    )
}

startScrape()