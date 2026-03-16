#!/bin/bash
export ANTHROPIC_BASE_URL="http://localhost:8095"
export ANTHROPIC_API_KEY="dummy_key_for_proxy"
open -a "Claude" --env ANTHROPIC_BASE_URL="http://localhost:8095" --env ANTHROPIC_API_KEY="dummy_key_for_proxy"
