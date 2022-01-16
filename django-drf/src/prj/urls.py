from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('prj.auth_urls')),
    path('tinymce/', include('tinymce.urls')),
]

from rest_framework import routers
from djoser import views as djoser_views
from paper import views as paper_views

if settings.DEBUG:
    router = routers.DefaultRouter(trailing_slash=False)
else:
    router = routers.SimpleRouter(trailing_slash=False)

router.register("users", djoser_views.UserViewSet)
router.register("papers", paper_views.PaperViewSet)
router.register("questions", paper_views.QuestionViewSet)

urlpatterns += [
    path('api/', include(router.urls)),
]
