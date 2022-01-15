from django.db import models
from django.utils.translation import gettext_lazy as _

from tinymce.models import HTMLField

from .model_mixins import NameMixin


class Question(models.Model):
    description = HTMLField(_('Description'))

    right_answer_choices = models.ManyToManyField(
        to='QuestionAnswerChoice', blank=True, related_name='+')

    class Meta:
        verbose_name = _('Question')

    def __str__(self) -> str:
        return self.description


class QuestionAnswerChoice(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='choices')
    description = HTMLField(_('Description'))
    sequence = models.PositiveSmallIntegerField(default=10)

    class Meta:
        verbose_name = _('Question Answer Choice')
        ordering = ('sequence', 'id')

    def __str__(self) -> str:
        return self.description


class Paper(NameMixin):

    class Meta:
        verbose_name = _('Paper')


class PaperQuestionItem(models.Model):
    paper = models.ForeignKey(
        Paper, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    sequence = models.PositiveSmallIntegerField(default=10)

    selected_choices = models.ManyToManyField(QuestionAnswerChoice, blank=True)

    class Meta:
        verbose_name = _('Paper Question Item')
        ordering = ('sequence', 'id')

    def __str__(self) -> str:
        return '{}'.format(self.id)
