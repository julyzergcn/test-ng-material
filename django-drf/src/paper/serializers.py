from rest_framework import serializers

from . import models


class QuestionSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.Question
        fields = ('url', 'id', 'description')


class PaperSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.Paper
        fields = ('url', 'id', 'name')
