const recursive = require("recursive-readdir");
const fs = require('fs');
const options = require('../config/options.json');

function replaceUrls() {
    const urls = {
        origin: new URL(options.site_url).origin + "/",
        http_origin: "",
        https_origin: "",
        originToReplace: new URL(options.urlToReplace).origin + "/",
        https_site_url: options.site_url.includes("https") ? options.site_url : options.site_url.replace("http", 'https'),
        host: new URL(options.site_url).host,
        hostToReplace: new URL(options.urlToReplace).host
    }

    urls.http_origin = urls.origin.replace("https", 'http');
    urls.https_origin = urls.origin.includes("https") ? urls.origin : urls.origin.replace("http", 'https');
    urls.https_site_url = urls.https_site_url.endsWith("/") ? urls.https_site_url : urls.https_site_url + "/";

    recursive(options.directory_to_save, ["*.ttf", "*.json", "*.png", "*.jpg"])
    .then(
        function(files) {
            const versionPattern = /_v(%|=)([a-zA-Z0-9]+)/gi
            
            files.map((file) => {
                if(options.removeVersionFromFileNames && versionPattern.test(file)) {
                    fs.rename(file, file.replace(versionPattern, ""), function(err) {
                        if (err) console.log('ERROR: ' + err);
                    });
                }
                
                if(file.endsWith(".html") || file.endsWith(".xml") || file.endsWith(".xsl") || file.endsWith(".txt")) {
                    const data = fs.readFileSync(file, 'utf8');

                    let newData = data
                        .replaceAll(urls.http_origin, urls.https_origin)
                        .replaceAll(urls.host, urls.hostToReplace)
                        .replaceAll("/en", "")

                    if(options.removeVersionFromFileNames)
                        newData = newData.replaceAll(versionPattern, "");
                    
                    fs.writeFileSync(file, newData, 'utf-8');
                }
            })
        },
        function(error) {
            console.error("something exploded", error);
        }
    )
    .then(() => {
        console.log("Urls replaced");
        console.log("Site downloaded");
    })
    .catch((error) => {
        console.error("something exploded", error);
    })
}

function clearFolder() {
    fs.rmSync(options.directory_to_save, { recursive: true, force: true });
    console.log('Folder cleared');
}


const pages = [
    options.site_url,
    `${options.site_url}/sitemap.xml`,
    `${options.site_url}/sitemap.xsl`,
    `${options.site_url}/sitemap-pages.xml`,
    `${options.site_url}/sitemap-posts.xml`,
    `${options.site_url}/sitemap-authors.xml`,
    `${options.site_url}/sitemap-tags.xml`,
    `${options.site_url}/error-404/`,
    `${options.site_url}/error/`,
    `${options.site_url}/robots.txt`,
]

let scrape_options = {
    urls: pages,
    directory: options.directory_to_save,
    recursive: options.isRecursive,
    prettifyUrls: true,
    filenameGenerator: 'bySiteStructure',
    requestConcurrency: 4,
    maxRecursiveDepth: 2,
    urlFilter: (url) => {
        return (url.startsWith(new URL(options.site_url).origin) && url.includes(options.locale))
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
        { selector: 'link[rel="amphtml"]', attr: 'href' },
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

    const startTime = Date.now();

    await clearFolder()

    scrape(scrape_options)
    .then((res) => {
        console.log('Site downloaded')
        replaceUrls()

        const endTime = Date.now();
        const totalTime = (endTime - startTime)/1000;
        console.log(`Total time: ${totalTime}s`)
        return res
    })
    .catch(e => {
        console.error(e)
        return e
    })

}

module.exports = startScrape