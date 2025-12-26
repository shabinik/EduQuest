from django.urls import path
from . views import SuperAdminTenantListView,SuperAdminTenantStatusView,SuperAdminTenantDeleteView,SuperAdminBillingView

urlpatterns = [
    path("tenants/",SuperAdminTenantListView.as_view(),name='superadmin-tenants'),
    path("tenants/<uuid:tenant_id>/status/",SuperAdminTenantStatusView.as_view(),name='tenant-status'),
    path("tenants/<uuid:tenant_id>/delete/",SuperAdminTenantDeleteView.as_view(), name='tenant-delete'),
    path("tenants/billing/", SuperAdminBillingView.as_view(),name='superadmin-billing'),


]