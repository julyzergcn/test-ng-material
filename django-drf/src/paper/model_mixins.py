from django.db import models
from django.utils.translation import gettext_lazy as _


class NameMixin(models.Model):
    name = models.CharField(_('Name'), max_length=255)

    def __str__(self) -> str:
        return self.name

    class Meta:
        abstract = True
