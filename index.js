const recursive = require("recursive-readdir");
const fs = require('fs');

const directory_to_save = "D:/projects/scraper/site"
const site_url = "https://cm.wlglobal.solutions/ru/"
const locale = "ru"
const urlToReplace = "https://www.wlglobal.solutions"
const isRecursive = true

function clearFolder() {
    fs.rmSync(directory_to_save, { recursive: true, force: true });
    console.log('Folder cleared');
}

function replaceUrls() {
    console.log('Urls replacing');

    recursive(directory_to_save, ["*.ttf", "*.json", "*.png", "*.jpg", "*.txt"])
    .then(
        function(files) {
        
            files.map((file) => {

                if(file.endsWith(".html")) {
                    const data = fs.readFileSync(file, 'utf8');

                    let newData = data.replaceAll(new URL(site_url).origin, urlToReplace)
    
                    fs.writeFileSync(file, newData, 'utf-8');
                }
            })
        },
        function(error) {
            console.error("something exploded", error);
        }
    )
    .then(() => {
        console.log('Urls replaced');
    })
    .catch((error) => {
        console.error("something exploded", error);
    })
}

const pages = [
    site_url,
    `${site_url}/sitemap.xml`,
    `${site_url}/sitemap.xsl`,
    `${site_url}/sitemap-pages.xml`,
    `${site_url}/sitemap-posts.xml`,
    `${site_url}/sitemap-authors.xml`,
    `${site_url}/sitemap-tags.xml`,
    `${site_url}/error-404/`,
    `${site_url}/error/`,
    `${site_url}/robots.txt`,
]

let options = {
    urls: pages,
    directory: directory_to_save,
    recursive: isRecursive,
    prettifyUrls: true,
    filenameGenerator: 'bySiteStructure',
    requestConcurrency: 4,
    maxRecursiveDepth: 4,
    urlFilter: (url) => {
        return (url.startsWith(new URL(site_url).origin) && url.includes(locale))
    },
    sources: [
        { selector: 'style' },
        { selector: '[style]', attr: 'style' },
        { selector: 'img', attr: 'src' },
        { selector: 'img', attr: 'srcset' },
        { selector: 'input', attr: 'src' },
        { selector: 'object', attr: 'data' },
        { selector: 'embed', attr: 'src' },
        { selector: 'param[name="movie"]', attr: 'value' },
        { selector: 'script', attr: 'src' },
        { selector: 'link[rel="stylesheet"]', attr: 'href' },
        { selector: 'link[rel*="icon"]', attr: 'href' },
        { selector: 'svg *[xlink\\:href]', attr: 'xlink:href' },
        { selector: 'svg *[href]', attr: 'href' },
        { selector: 'picture source', attr: 'srcset' },
        { selector: 'meta[property="og\\:image"]', attr: 'content' },
        { selector: 'meta[property="og\\:image\\:url"]', attr: 'content' },
        { selector: 'meta[property="og\\:image\\:secure_url"]', attr: 'content' },
        { selector: 'meta[property="og\\:audio"]', attr: 'content' },
        { selector: 'meta[property="og\\:audio\\:url"]', attr: 'content' },
        { selector: 'meta[property="og\\:audio\\:secure_url"]', attr: 'content' },
        { selector: 'meta[property="og\\:video"]', attr: 'content' },
        { selector: 'meta[property="og\\:video\\:url"]', attr: 'content' },
        { selector: 'meta[property="og\\:video\\:secure_url"]', attr: 'content' },
        { selector: 'video', attr: 'src' },
        { selector: 'video source', attr: 'src' },
        { selector: 'video track', attr: 'src' },
        { selector: 'audio', attr: 'src' },
        { selector: 'audio source', attr: 'src' },
        { selector: 'audio track', attr: 'src' },
        { selector: 'frame', attr: 'src' },
        { selector: 'iframe', attr: 'src' },
        { selector: '[background]', attr: 'background' }
    ],
    plugins: []
};

const startScrape = async  () => {
    const {default: scrape} = await import("website-scraper");

    await clearFolder()

    scrape(options)
    .then(() => {
        replaceUrls()
    })
    .catch(e => 
        console.error(e)
    )
}

startScrape()