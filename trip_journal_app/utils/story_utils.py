from django.shortcuts import redirect, render
from django.contrib import messages, auth

from trip_journal_app.models import Story


def story_contents(request, story_id, template, check_user=False):
    # if story_id is empty rednders template without added text
    story_blocks = {}
    story = Story()
    # if story_id exists renders its content to story.html page
    if story_id:
        try:
            story = Story.objects.get(pk=int(story_id))
            if check_user:
                user = auth.get_user(request)
                if user != story.user:
                    messages.info(request, 'Edit your own stories!')
                    return redirect('/my_stories/')
            if story.text:
                story_blocks = (
                    story.get_text_with_pic_objects()
                )
        # if story_id doesn't exist redirects user to list of his/her stoires
        except Story.DoesNotExist:
            msg = ("Such a story doesn't exist. But you can create a new one.")
            messages.info(request, msg)
            return redirect('/my_stories/')
    context = {
        'story_blocks': story_blocks,
        'story': story
    }
    return render(request, template, context)
