import re

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


class Webscrape:
    def __init__(self, start_time, end_time, start_date, end_date):
        # Validate time and date formats
        time_pattern = r'^[0-2][0-9]:[0-5][0-9]$'
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        if not re.match(time_pattern, start_time) or not re.match(time_pattern, end_time):
            raise ValueError("Start time or end time is in an invalid format. Expected 'HH:MM'.")
        if not re.match(date_pattern, start_date) or not re.match(date_pattern, end_date):
            raise ValueError("Start date or end date is in an invalid format. Expected 'YYYY-MM-DD'.")

        self.start_time = start_time
        self.end_time = end_time
        self.start_date = start_date
        self.end_date = end_date

        # Predefined list of library search URLs (for all buildings)
        self.pre_search_urls = [
            'https://libcal.library.ubc.ca/r/search/ikbstudy#s-lc-public-pt',
            'https://libcal.library.ubc.ca/r/search/maa#s-lc-public-pt',
            'https://libcal.library.ubc.ca/r/search/koerner_library#s-lc-public-pt',
            'https://libcal.library.ubc.ca/r/search/woodward_library#s-lc-public-pt',
            'https://libcal.library.ubc.ca/r/search/research_commons#s-lc-public-pt'
        ]

    def get_rooms(self):
        """
        Simplified method: for the given timeframe, scrape each library URL once,
        and return a combined list of available rooms.
        """
        results = []
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for url in self.pre_search_urls:
                result_url = self.__get_url_from_filter(browser, url)
                if result_url:
                    rooms = self.__get_rooms_info(browser, result_url)
                    results.extend(rooms)
            browser.close()
        return results

    def __get_url_from_filter(self, browser, pre_search_url):
        """
        Navigate to the given URL, fill in the search criteria, click search,
        and return the URL of the results page.
        """
        page = browser.new_page()
        try:
            page.set_default_timeout(15000)
            page.goto(pre_search_url)
            page.wait_for_selector('#s-lc-date', timeout=15000)
            page.fill('#s-lc-date', self.start_date)
            page.fill('#s-lc-time-start', self.start_time)
            page.fill('#s-lc-time-end', self.end_time)
            page.click('#s-lc-go')
            page.wait_for_selector('#s-lc-eq-search-results', timeout=10000)
            result_url = page.url
        except PlaywrightTimeoutError:
            result_url = ''
        page.close()
        return result_url

    def __get_rooms_info(self, browser, result_url):
        """
        Given a results page URL, scrape the page for available rooms.
        Returns a list of dictionaries containing room data.
        """
        page = browser.new_page()
        try:
            page.set_default_timeout(15000)
            page.goto(result_url)
            page.wait_for_selector('#s-lc-eq-search-results', timeout=10000)
        except PlaywrightTimeoutError:
            page.close()
            return []

        # If there's an element indicating no results, return empty list.
        if page.query_selector('#s-lc-eq-search-results > p'):
            page.close()
            return []

        room_elements = page.query_selector_all('#s-lc-eq-search-results .media.s-lc-booking-suggestion')
        available_rooms = []
        for elem in room_elements:
            room_item = {
                'url': '',
                'group': '',
                'room_num': '',
                'date': self.start_date,  # using the search date
                'start_time': self.start_time,
                'end_time': self.end_time
            }
            link_el = elem.query_selector("h3 a")
            if link_el:
                relative_url = link_el.get_attribute('href')
                if relative_url:
                    room_item['url'] = 'https://libcal.library.ubc.ca' + relative_url
                room_item['room_num'] = link_el.inner_text()
            group_el = elem.query_selector('.s-lc-booking-group')
            if group_el:
                room_item['group'] = group_el.inner_text()
            available_rooms.append(room_item)

        page.close()
        return available_rooms


