#!/usr/bin/env python3
import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

client = ApiClient()

print("==========================================")
print("🚀 AUTONOMOUS INSTALLER RECRUITMENT")
print("==========================================\n")

states = ['Queensland', 'New South Wales', 'Victoria', 'Western Australia', 'South Australia']
search_terms = [
    'solar installer',
    'solar panel installation',
    'solar energy company',
    'renewable energy installer'
]

total_found = 0

print("🔍 Searching LinkedIn for solar installers...\n")

for state in states:
    print(f"\n📍 Searching in {state}...")
    
    for term in search_terms:
        query = f"{term} {state} Australia"
        print(f"  Query: \"{query}\"")
        
        try:
            result = client.call_api('LinkedIn/search_people', query={
                'keywords': query,
                'start': '0'
            })
            
            if result.get('success') and result.get('data'):
                items = result['data'].get('items', [])
                print(f"  Found: {len(items)} profiles")
                total_found += len(items)
                
                # Display first 3 results
                for i, person in enumerate(items[:3], 1):
                    print(f"    {i}. {person.get('fullName', 'N/A')} - {person.get('headline', 'N/A')}")
            else:
                print(f"  No results")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")

print(f"\n\n📊 Total profiles found: {total_found}")
print("\n✅ Search complete!")
print("==========================================\n")
