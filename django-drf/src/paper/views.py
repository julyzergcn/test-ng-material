from rest_framework import viewsets

from . import serializers, models


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.QuestionSerializer
    queryset = models.Question.objects.all()


class PaperViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PaperSerializer
    queryset = models.Paper.objects.all()
