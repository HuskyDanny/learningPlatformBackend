
#print diamond
def triangles(n):
    if not n & 1:
        raise ValueError('n must be odd')
    print_diamond(0, n, n // 2)

def print_diamond(start, stop, midpoint):
    if start < stop:
        if start <= midpoint:
            print('  ' * (midpoint - start) + '* ' * ((start *2 ) + 1))
        else:
            print('  ' * (start - midpoint) + '* ' * (((stop - start) * 2) - 1))
        print_diamond(start + 1, stop, midpoint)

triangles(7)


#For preorder, goes in stack, monotonically decreasing stack
INT_MIN = -2**32
  
def canRepresentBST(pre): 
  
    # Create an empty stack 
    s = [] 
  
    # Initialize current root as minimum possible value 
    root = INT_MIN 

    # Traverse given array 
    for value in pre:  
        #NOTE:value is equal to pre[i] according to the  
        #given algo    
        
        # If we find a node who is on the right side 
        # and smaller than root, return False 
        if value < root : 
            return False 
        
        # If value(pre[i]) is in right subtree of stack top,  
        # Keep removing items smaller than value 
        # and make the last removed items as new root 
        while(len(s) > 0 and s[-1] < value) : 
            root = s.pop() 
            
        # At this point either stack is empty or value 
        # is smaller than root, push value 
        s.append(value) 

    return True

print(canRepresentBST([5,3,6,7]))


#post order
# bool _IsCurrentPostOrder(int a[],int len)
#     {
#         if( a == NULL ||len <= 0)
#             return false;
 
#         //对区间进行分段
#         int i = 0;
#         for(i = 0; i < len - 1; ++i)
#         {
#             if(a[i] > a[len - 1])
#                 break;//找到分割点
#         }
 
#         for(int j = i; j < len - 1 ; ++j)
#         {
#             if(a[j] < a[len - 1])//遇到小于根节点的值，说明不是合法后序序列，返回
#                 return false;
#         }
 
#         bool left = true;
#         if(i > 0)
#             left = _IsCurrentPostOrder(a,i);
 
#         bool right = true;
#         if(i < len - 1)
#             right = _IsCurrentPostOrder(a+i,len-i-1);
 
#         return left && right;

#merge sets

def mergeSets(sets):

    allIndexes = []
    answer = []
    for set in sets:
        #0 meaning start, 1 meaning end
        allIndexes.append((set[0],0))
        allIndexes.append((set[1],1))

    allIndexes.sort(key=lambda x : x[0])

    start = []
    end = []

    for index in allIndexes:
        
        if (not index[1]):
            start.append(index[0])
        if (index[1]):
            end.append(index[0])
        
        if (len(start) == len(end)) :
            answer.append([start[0], end[-1]])
            start = []
            end = []
    return answer

print(mergeSets([[6,8],[2,4],[1,9],[4,7]]))

#graph
        # edges = {}
        # edge_values = {}
        
        # index = 0
        # for equation in equations:
        #     if equation[0] not in edges:
        #         edges[equation[0]] = []
        #         edge_values[equation[0]] = []
        #     if equation[1] not in edges:
        #         edges[equation[1]] = []
        #         edge_values[equation[1]]= []
        #     edges[equation[0]].append(equation[1])
        #     edges[equation[1]].append(equation[0])
        #     edge_values[equation[0]].append(values[index])
        #     edge_values[equation[1]].append(1/values[index])
        #     index += 1


        # edges = new ArrayList<Edge>();
    	# map = new HashMap<Vertex, ArrayList<Edge>>();
    	# mapVertex = new HashMap<Vertex, ArrayList<Vertex>>();
    	# HashSet<Vertex> setVertex = new HashSet<>();
    	# HashSet<Edge> setEdge = new HashSet<>();


#loggest mountain array
# class Solution:
#     def longestMountain(self, A: List[int]) -> int:
        
#         forward = [0] * len(A)
#         backward = [0] * len(A)
#         maximum = 0
        
#         for i in range(len(A)) :
#             if (i == 0 or A[i] <= A[i-1]) :
#                 forward[i] = 1
                
#             else:
#                 forward[i] = forward[i-1] + 1
                
#         for i in range(len(A)-1,-1,-1) :
#             if (i == len(A)-1 or A[i] <= A[i+1]) :
#                 backward[i] = 1
                
#             else:
#                 backward[i] = backward[i+1] + 1
        
        
#         for i in range(len(A)):
#             if (forward[i] > 1 and backward[len(A)-1-i] > 1):
#                 maximum = max(maximum, forward[i]+backward[len(A)-1-i]-1)
        
#         return maximum

