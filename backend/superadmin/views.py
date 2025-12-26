from django.shortcuts import render,get_object_or_404
from rest_framework.views import APIView
from accounts.permissions import IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from accounts.models import Tenant
from . seralizers import TenantListSerializer,TenantBillingSerializer
from rest_framework.response import Response

# Create your views here.

class SuperAdminTenantListView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def get(self,request):
        tenants = Tenant.objects.all().order_by("created_at")
        serializer = TenantListSerializer(tenants, many=True)
        return Response(serializer.data)
    

# Block OR Suspend
class SuperAdminTenantStatusView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def post(self,request,tenant_id):
        status_value = request.data.get("status")

        if status_value not in ["active","inactive","suspended"]:
            return Response({"error":"Invalid status"},status=400)
        
        tenant = get_object_or_404(Tenant, id = tenant_id)
        tenant.status = status_value
        tenant.save()

        return Response({"success":True, "status":tenant.status})


class SuperAdminTenantDeleteView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def post(self, request, tenant_id):
        tenant = get_object_or_404(Tenant,id = tenant_id)
        tenant.delete()
        return Response({"success":True})
    


class SuperAdminBillingView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def get(self, request):
        tenants = Tenant.objects.all().order_by('-created_at')
        serializer = TenantBillingSerializer(tenants, many = True)
        return Response(serializer.data)