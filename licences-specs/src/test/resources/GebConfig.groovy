import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions

environments {
    chrome {
        driver = { new ChromeDriver() }
    }

    chromeHeadless {
        driver = {
            ChromeOptions options = new ChromeOptions()
            options.addArguments('headless')
            new ChromeDriver(options)
        }
    }
}

// Default if geb.env is not set to one of 'chrome', or 'chromeHeadless'
driver = {
    new ChromeDriver()
}

baseUrl = System.getenv('LICENCES_URI') ?: "http://localhost:3000/"

reportsDir = "build/geb-reports"
