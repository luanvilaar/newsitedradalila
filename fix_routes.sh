#!/bin/bash

# Update bioimpedance route
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' src/app/api/patients/[id]/bioimpedance/route.ts
sed -i '' '19a\  const { id } = await params;' src/app/api/patients/[id]/bioimpedance/route.ts
sed -i '' 's/params\.id/id/g' src/app/api/patients/[id]/bioimpedance/route.ts

# Update prescriptions route  
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' src/app/api/patients/[id]/prescriptions/route.ts
sed -i '' '19a\  const { id } = await params;' src/app/api/patients/[id]/prescriptions/route.ts
sed -i '' 's/params\.id/id/g' src/app/api/patients/[id]/prescriptions/route.ts

# Update documents route
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' src/app/api/patients/[id]/documents/route.ts
sed -i '' '19a\  const { id } = await params;' src/app/api/patients/[id]/documents/route.ts
sed -i '' 's/params\.id/id/g' src/app/api/patients/[id]/documents/route.ts

# Update patient detail route
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' src/app/api/patients/[id]/route.ts
sed -i '' '19a\  const { id } = await params;' src/app/api/patients/[id]/route.ts
sed -i '' 's/params\.id/id/g' src/app/api/patients/[id]/route.ts

echo "Routes updated!"
