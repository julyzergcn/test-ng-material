from django.contrib import admin

from . import models


class QuestionAnswerChoiceInline(admin.TabularInline):
    model = models.QuestionAnswerChoice
    extra = 0
    show_change_link = True


@admin.register(models.Question)
class QuestionAdmin(admin.ModelAdmin):
    inlines = [QuestionAnswerChoiceInline]
    search_fields = ['description']
    autocomplete_fields = ['right_answer_choices']


@admin.register(models.QuestionAnswerChoice)
class QuestionAnswerChoiceAdmin(admin.ModelAdmin):
    search_fields = ['description']


class PaperQuestionItemInline(admin.TabularInline):
    model = models.PaperQuestionItem
    extra = 0
    autocomplete_fields = ('question', 'selected_choices')
    fields = ('sequence', 'question', 'selected_choices')


@admin.register(models.Paper)
class PaperAdmin(admin.ModelAdmin):
    inlines = [PaperQuestionItemInline]
