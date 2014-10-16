import json

from trip_journal_app.models import Story


def rename_coordinates(coordinates):
    coordinates['lat'] = coordinates.pop('k')
    coordinates['lng'] = coordinates.pop('B')


def rename_coord_in_stories():
    for story in Story.objects.all():
        text = json.loads(story.text)
        changed = False
        for block in text:
            if block['marker']:
                if 'k' in block['marker']:
                    rename_coordinates(block['marker'])
                    changed = True
        if changed:
            story.text = json.dumps(text)
            story.save()


def delete_null_coordinates():
    for story in Story.objects.all():
        text = story.text
        for block in text:
            # print block['marker']
            if block['marker'] == {"lat": None, "lng": None}:
                block['marker'] = None
        story.text = json.dumps(text)
        story.save()
