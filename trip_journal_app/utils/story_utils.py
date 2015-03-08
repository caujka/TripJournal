from django.shortcuts import redirect, render
from django.contrib import messages, auth

from trip_journal_app.models import Story, Subscriptions


def story_contents(request, story_id, template,
                   check_user=False, check_published=False):
    # if story_id is empty rednders template without added text
    # story_blocks = {}
    story = Story()
    user = auth.get_user(request)
    is_subscribed = None
    # if story_id exists renders its content to story.html page
    if story_id:
        try:
            story = Story.objects.get(pk=int(story_id))
            is_subscribed = Subscriptions.objects.filter(subscriber=user.id, subscription=story.user_id)
            if check_user:
                if user != story.user:
                    messages.info(request, 'Edit your own stories!')
                    return redirect('/my_stories/')
            # if story.text:
            #             story_blocks = (
            #                 story.get_text_with_pic_objects()
            #             )
            if check_published:
                if user != story.user and story.published == 0:
                    return render(request, 'story_error_page.html')
                else:
                    if story.text:
                        story_blocks = (
                            story.get_text_with_pic_objects()
                        )
                    published_content = {
                        'story_blocks': story_blocks,
                        'story': story,
                        'user': user,
                    }
                    return render(request, template, published_content)

        # if story_id doesn't exist redirects user to list of his/her stoires
        except Story.DoesNotExist:
            msg = ("Such a story doesn't exist. But you can create a new one.")
            messages.info(request, msg)
            return redirect('/my_stories/')
    context_editor = {
        # 'story_blocks': story_blocks,
        'is_subscribed': is_subscribed,
        'story': story,
        'user': user,
    }
    return render(request, template, context_editor)

