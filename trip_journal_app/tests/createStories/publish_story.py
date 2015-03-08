import json
import requests
import httplib

from time import sleep
from urllib import urlencode
from get_browser_cookie import *
from cr_story import *
from publish_story_settings import db_address, site_configs, delay_between_post_blocks

def publishStory(story, cookiesFromBrowser, host, port, urlImgUpload, delay=0):
	body =  {"title": "", "blocks": []}
	storyId = ""
	cookies = 'djdt=hide; sessionid=%s; csrftoken=%s' % (cookiesFromBrowser["sessionid"],cookiesFromBrowser["csrftoken"])
	headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": 'text/plain', 
	"Cookie": cookies, 'X_REQUESTED_WITH': 'XMLHttpRequest'}
	conn = httplib.HTTPConnection(host, port)

	for block in story:
		if (block["type"] == "title"):
			body["title"] = block["content"]
			if storyId:
				conn.request("POST", "/save/%s" % storyId, json.dumps(body), headers)
				response = conn.getresponse()
		else :
			body["blocks"] += [block["content"]]
			conn.request("POST", "/save/%s" % storyId, json.dumps(body), headers)
			response = conn.getresponse()
			if not storyId: 
				storyId =  response.read()

			if (block["type"] == "img"):
				urlImg = urlImgUpload + "%s" % storyId
				files = {'file': (block["imgName"], block["imgFile"] , "image/jpeg")}
				r = requests.post(urlImg, files=files, cookies=cookiesFromBrowser)
				imgId = r.text

				body["blocks"][-1]["id"] = imgId
				conn.request("POST", "/save/%s" % storyId, json.dumps(body), headers)
				response = conn.getresponse()
		sleep(delay)
	params = urlencode({'publish': 'False', 'csrftoken': cookiesFromBrowser["csrftoken"]})
	conn.request("POST", "/publish/%s" % storyId, params, headers)
	conn.getresponse()
	conn.close()

"""def publishManyStories(cookiesFromBrowser):
	amount = random.randint(minStories, maxStories)
	for i in range(1, amount + 1):
		publishStory(cookiesFromBrowser)"""

if __name__ == "__main__":
	Cooks = getCookies(db_address, site_configs["site"], site_configs["checkingAddress"])
	if Cooks:
		story = createStory()
		publishStory(story, Cooks, site_configs["host"], site_configs["port"], site_configs["urlImgUpload"], delay_between_post_blocks)

