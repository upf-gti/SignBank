#!/bin/bash

# Function to list and select containers interactively
select_containers() {
    containers=($(docker compose -f "docker-compose-local.yaml" config --services))
    selected=()
    
    # ANSI color codes
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    NC='\033[0m' # No Color

    # Function to display the menu
    display_menu() {
        clear
        echo "Available containers:"
        echo "Use Up/Down arrows to navigate, Left/Right arrows to select/deselect, Enter to confirm"
        echo ""
        for i in "${!containers[@]}"; do
            if [[ " ${selected[*]} " =~ " ${containers[i]} " ]]; then
                if [ $i -eq $current ]; then
                    echo -e "${RED}[*] ${containers[i]}${NC}"
                else
                    echo -e "${GREEN}[*] ${containers[i]}${NC}"
                fi
            else
                if [ $i -eq $current ]; then
                    echo -e "${RED}[ ] ${containers[i]}${NC}"
                else
                    echo "[ ] ${containers[i]}"
                fi
            fi
        done
    }

    # Interactive menu
    current=0
    while true; do
        display_menu

        # Read a single character
        read -rsn1 key

        case "$key" in
            $'\x1B')  # ESC key
                read -rsn2 key
                case "$key" in
                    '[A') # Up arrow
                        ((current--))
                        [ $current -lt 0 ] && current=$((${#containers[@]} - 1))
                        ;;
                    '[B') # Down arrow
                        ((current++))
                        [ $current -eq ${#containers[@]} ] && current=0
                        ;;
                    '[C') # Right arrow (select)
                        if [[ ! " ${selected[*]} " =~ " ${containers[current]} " ]]; then
                            selected+=(${containers[current]})
                        fi
                        ;;
                    '[D') # Left arrow (deselect)
                        selected=(${selected[@]/${containers[current]}})
                        ;;
                esac
                ;;
            '') # Enter key
                break
                ;;
        esac
    done

    # Set the selected_containers variable
    selected_containers="${selected[*]}"
}

# Function to build selected containers
build_containers() {
    for container in $selected_containers; do
        echo "Building container: $container"
        docker compose -f "docker-compose-local.yaml" build "$container"
        docker compose -f "docker-compose-local.yaml" up --no-deps -d --force-recreate "$container"
    done
}

# Main script
echo "Welcome to the Docker Manager!"

select_containers

echo "Selected containers: $selected_containers"
read -p "Press Enter to continue..."

build_containers