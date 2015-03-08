import random
import os
from publish_story_settings import story_configs

def generateAmountOfSpecificBlock(rangeOfBlocks, typeOfBlock):
	blocks = []
	numberOfBlocks = random.randint(rangeOfBlocks[0], rangeOfBlocks[1])
	for i in range(0, numberOfBlocks):
		blocks.append({"type":typeOfBlock})
	return blocks

def generateTypesOfBlocks(rangeOfTextBlock, rangeOfImageBlock):
	blocks = [{"type":"title"}]
	blocks += generateAmountOfSpecificBlock(rangeOfTextBlock, "text")
	blocks += generateAmountOfSpecificBlock(rangeOfImageBlock, "img")
	random.shuffle(blocks)
	return blocks

def generateContent(blocks):
	for block in blocks:
		if block["type"] == "title":
			fname = random.choice(os.listdir(story_configs["titlePath"]))
			block["content"] = open(story_configs["titlePath"] + fname, "rb").read(-1)
		elif block["type"] == "text":
			fname = random.choice(os.listdir(story_configs["textPath"]))
			content = open(story_configs["textPath"] + fname, "rb").read(-1)
			block["content"] = {"type": "text", "content": content, "marker": None}
		elif block["type"] == "img":
			imgName = random.choice(os.listdir(story_configs["imagePath"]))
			img = open(story_configs["imagePath"] + imgName, "rb").read()
			block["content"] = {"type": "img", "id": 0, "marker": None}
			block["imgName"] = imgName
			block["imgFile"] = img
	return blocks

def createStory():
	blocks = generateTypesOfBlocks(story_configs["rangeOfTextBlock"], story_configs["rangeOfImageBlock"])
	story = generateContent(blocks)
	return story

