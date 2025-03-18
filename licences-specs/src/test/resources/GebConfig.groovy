import org.openqa.selenium.Dimension
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions

atCheckWaiting = true

waiting {
  timeout = 10
}

environments {
  chrome {
    driver = { new ChromeDriver() }
  }

  chromeHeadless {
    driver = {
      ChromeOptions options = new ChromeOptions()
      options.addArguments('headless')
      def d = new ChromeDriver(options)
      d.manage().window().setSize(new Dimension(1920, 1080))
      d
    }
  }
}

// Default if geb.env is not set to one of 'chrome', or 'chromeHeadless'
driver = {
  ChromeOptions options = new ChromeOptions()
  options.addArguments('headless')
//  options.addArguments('chrome')
  new ChromeDriver(options)
}

baseUrl = System.getenv('LICENCES_URI') ?: "http://localhost:3000/"

reportsDir = "build/geb-reports"
